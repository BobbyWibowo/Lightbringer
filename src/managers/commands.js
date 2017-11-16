const path = require('path')
const chalk = require('chalk')
const read = require('readdir-recursive')
const Discord = require('discord.js')

const DELETE = 8000

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
      throw new Error('The bot can not reload individual commands for the time being\u2026')
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

      // Basic check to use \\ instead of / for Windows machine
      const _filePath = `${folder}${folder.includes('\\') ? '\\' : '/'}${file}`
      const command = require(_filePath)

      const error = this._validateCommand(command)
      if (error) {
        console.error(`Failed to load '${file}': ${chalk.red(error)}`)
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
          console.error(`Failed to init '${parsed.name}':`, err)
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
      msg.error = async (text, timeout = DELETE, bypassLog = false) => {
        if (!bypassLog) {
          console.info(`${chalk.yellow(`[${command.info.name}]`)} ${text}`)
        }

        try {
          await msg.edit(`${consts.e}${text || 'Something failed!'}`)
          if (timeout >= 0) return msg.delete(timeout)
        } catch (err) {}
      }

      msg.success = async (text, timeout = DELETE) => {
        try {
          await msg.edit(`${consts.s}${text || 'Success!'}`)
          if (timeout >= 0) return msg.delete(timeout)
        } catch (err) {}
      }

      this.bot.managers.stats.increment('commands')
    }

    try {
      await command.run(this.bot, msg, args, ...extended)
    } catch (err) {
      if (msg) {
        console.info(`${chalk.red(`[${command.info.name}]`)} ${err.stack || err}`)
        msg.error(err, DELETE, true)
      } else {
        console.error(`${chalk.red(`[${command.info.name}]`)} ${err.stack || err}`)
      }
    }
  }
}

module.exports = CommandManager
