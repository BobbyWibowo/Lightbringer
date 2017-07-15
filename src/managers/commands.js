const path = require('path')
const chalk = require('chalk')
const read = require('readdir-recursive')
const Discord = require('discord.js')

class CommandManager {
  constructor () {
    this.bot = bot
    this._commands = []
    this._categories = []
    this._count = 0
  }

  _validateCommand (object) {
    if (typeof object !== 'object') {
      return 'command setup is invalid'
    }
    if (typeof object.run !== 'function') {
      return 'run function is missing'
    }
    if (typeof object.info !== 'object') {
      return 'info object is missing'
    }
    if (typeof object.info.name !== 'string') {
      return 'info object is missing a valid name field'
    }
    if (object.info.aliases && object.info.aliases.constructor.name !== 'Array') {
      return 'info object has an invalid aliases field (it must be an array)'
    }
    return null
  }

  async loadCommands (folder, manual) {
    let x = 0
    if (manual === '-a') {
      for (const c of this._commands) {
        if (c.info._filePath && delete require.cache[c.info._filePath]) {
          x++
        }
      }
      delete this._commands
      delete this._categories
    } else if (manual !== undefined) {
      throw new Error('The bot can not reload individual commands for the time being.')
    }

    this._commands = []
    this._categories = []

    let y = 0
    const files = read.fileSync(folder)
    for (let file of files) {
      file = file.substr(folder.length + 1)
      const parsed = path.parse(file)
      const basename = parsed.base

      if (basename.startsWith('_') || !basename.endsWith('.js')) {
        continue
      }

      // NOTE: Basic check to use \\ instead of / for Windows machine
      const _filePath = `${folder}${folder.includes('\\') ? '\\' : '/'}${file}`
      const command = require(_filePath)

      const error = this._validateCommand(command)
      if (error) {
        this.bot.logger.severe(`Failed to load '${file}': ${chalk.red(error)}`)
        continue
      }

      if (!command.category) {
        const category = file.includes(path.sep) ? path.dirname(file) : 'Uncategorized'
        command.info.category = category
        if (!this._categories.includes(category)) {
          this._categories.push(category)
        }
      }

      if (typeof command.init === 'function') {
        try {
          await command.init(this.bot)
        } catch (err) {
          this.bot.logger.severe(`Failed to init '${parsed.name}':`, err)
          continue
        }
      }

      command.info._filePath = _filePath
      this._commands.push(command)
      y++
    }
    this._count = y

    return {x, y}
  }

  all (category) {
    return !category ? this._commands : this._commands.filter(c =>
      c.info.category.toLowerCase() === category.toLowerCase()
    ).sort((a, b) => a.info.name.localeCompare(b.info.name))
  }

  categories () {
    return this._categories
  }

  get (name) {
    return this.findBy('name', name) || this.findIn('aliases', name)
  }

  findBy (key, value) {
    return this._commands.find(c => c.info[key] === value)
  }

  findIn (key, value) {
    return this._commands.find(c => c.info[key] && c.info[key].includes(value))
  }

  async execute (msg, command, args, ...extended) {
    if (msg instanceof Discord.Message) {
      const DELETE = 8000

      msg.error = async (message, options = {}) => {
        this.bot.logger.severe(message.stack || message)

        message = message.toString().startsWith('DiscordAPIError: ')
          ? `Error:\n${bot.utils.formatCode(message)}`
          : message.toString()

        await msg.edit(`❌\u2000${message || 'Something failed!'}`)
        options.timeout = options.timeout || DELETE
        return msg.delete(options)
      }

      msg.success = async (message, options = {}) => {
        await msg.edit(`✅\u2000${message || 'Success!'}`)
        options.timeout = options.timeout || DELETE
        if (options.timeout >= 0) return msg.delete(options)
      }

      this.bot.managers.stats.increment('commands')
    }

    try {
      await command.run(this.bot, msg, args, ...extended)
    } catch (err) {
      if (msg instanceof Discord.Message) {
        msg.error(err)
      } else {
        console.error(err)
      }
    }
  }
}

module.exports = CommandManager
