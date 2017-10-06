'use strict'

const path = require('path')
const fse = require('fs-extra')
const Discord = require('discord.js')
const readline = require('readline')
const didYouMean = require('didyoumean2')
const { stripIndents } = require('common-tags')

const Managers = require('./managers')

global.bot = exports.client = new Discord.Client()

bot.managers = {}

const configManager = bot.managers.config = new Managers.Config(bot, __dirname)
global.config = bot.config = configManager.load()
bot.storage = new Managers.Storage()

// bot.managers.notifications = new Managers.Notifications()

const logger = bot.logger = new Managers.Logger(bot)
const commands = bot.commands = new Managers.CommandManager(bot)
const stats = bot.managers.stats = new Managers.Stats(bot)

logger.inject()

const settings = global.settings = {
  dataFolder: path.resolve(__dirname, '..', 'data'),
  configsFolder: path.resolve(__dirname, '..', 'data', 'configs')
}

if (!fse.existsSync(settings.dataFolder)) fse.mkdirSync(settings.dataFolder)
if (!fse.existsSync(settings.configsFolder)) fse.mkdirSync(settings.configsFolder)

let beginTime
let loaded = false

const updateTitle = () => {
  const title = `Lightbringer - ${bot.user.tag}`
  process.title = title
  process.stdout.write(`\u001B]0;${title}\u0007`)
}

bot.on('ready', async () => {
  logger.info('Bot successfully logged in! Loading modules\u2026 (this may take a few seconds)')

  await bot.user.setAFK(true)
  await bot.user.setStatus(bot.user.settings.status)

  bot.parentDir = path.resolve(__dirname, '../..')
  bot.srcDir = __dirname

  bot.consts = require('./consts.js')
  bot.utils = require('./utils')

  bot.commandsDir = path.resolve(__dirname, 'commands')
  await commands.loadCommands(bot.commandsDir)

  updateTitle()
  logger.info(stripIndents`
    Stats:
    - User: ${bot.user.tag} (ID: ${bot.user.id})
    - Channels: ${bot.channels.size.toLocaleString()}
    - Guilds: ${bot.guilds.size.toLocaleString()}
    - Modules : ${bot.commands._count.toLocaleString()}
    - Prefix: ${config.prefix}
  `)

  stats.set('messages-sent', 0)
  stats.set('messages-received', 0)
  stats.set('mentions', 0)
  stats.set('commands', 0)

  delete bot.user.email
  delete bot.user.verified

  readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  }).on('line', line => {
    try {
      const restart = () => process.exit() // eslint-disable-line no-unused-vars
      console.log(eval(line) || 'undefined') // eslint-disable-line no-eval
    } catch (err) {
      console.error(err)
    }
  }).on('SIGINT', () => {
    process.exit(1)
  })

  loaded = true

  let elapsedTimeS
  if (beginTime) {
    const elapsedTime = process.hrtime(beginTime)
    elapsedTimeS = Math.floor((elapsedTime[0] * 1e9 + elapsedTime[1]) / 1e9)
    beginTime = null
  }
  const readyMessage = `Bot is ready!${elapsedTimeS ? ` - Time taken: **${elapsedTimeS}s**` : ''}`

  logger.info(readyMessage.replace(/\*/g, ''))

  if (config.statusChannel) {
    bot.channels.get(config.statusChannel).send(`✅\u2000${readyMessage}`)
  }
})

const parseCommand = async msg => {
  const DELETE = 8000
  const prefix = config.prefix.toLowerCase()
  const split = msg.content.substr(prefix.length).split(' ')

  let base = split[0].toLowerCase()
  if (!base) {
    return
  }

  if (bot.managers.stats.get('RELOADING')) {
    await msg.edit(`⛔\u2000The bot is still in the middle of reloading modules\u2026`)
    return msg.delete(DELETE)
  }

  let args = split.slice(1)

  let command = commands.get(base)
  if (command) {
    return commands.execute(msg, command, args)
  }

  const shortcut = bot.storage('shortcuts').get(base)

  if (shortcut) {
    base = shortcut.command.split(' ')[0].toLowerCase()
    args = shortcut.command.split(' ').splice(1).concat(args)

    command = commands.get(base)
    if (command) {
      return commands.execute(msg, command, args)
    } else {
      await msg.edit(`⛔\u2000The shortcut \`${shortcut.name}\` is improperly set up!`)
      return msg.delete(DELETE)
    }
  }

  const maybe = didYouMean(base, commands.all().map(c => c.info.name), {
    threshold: 5,
    thresholdType: 'edit-distance'
  })

  if (maybe) {
    await msg.edit(`❓\u2000Did you mean \`${prefix}${maybe}\`?`)
  } else {
    await msg.edit(`⛔\u2000No commands were found that were similar to \`${prefix}${base}\``)
  }

  return msg.delete(DELETE)
}

const logMention = msg => {
  if (!((msg.guild && msg.isMemberMentioned(msg.guild.me)) || (!msg.guild && msg.isMentioned(bot.user)))) {
    return
  }

  stats.increment('mentions')

  if (!config.mentionLogChannel) {
    return
  }

  // NOTE: Send to mentions log channel only if necessary
  const log = msg.guild ? bot.storage('mentions').get(msg.guild.id) : true

  if (!log) {
    return
  }

  commands.execute(undefined, commands.get('q'), ['-c'], {
    msg,
    channel: msg.channel,
    target: bot.channels.get(config.mentionLogChannel)
  })
}

bot.on('message', msg => {
  stats.increment(`messages-${bot.user.id === msg.author.id ? 'sent' : 'received'}`)
  logMention(msg)

  // NOTE: Ignore if the message wasn't sent by the bot's owner
  if (msg.author.id !== bot.user.id) {
    return
  }

  // NOTE: Ignore if the message was sent in a blacklisted server
  if (msg.guild && config.blacklistedServers && config.blacklistedServers.includes(msg.guild.id)) {
    return
  }

  // NOTE: Ignore if it didn't start with the bot's prefix
  if (!msg.content.toLowerCase().startsWith(config.prefix.toLowerCase())) {
    return
  }

  parseCommand(msg)
})

bot.on('messageUpdate', (old, msg) => {
  logMention(msg)
})

process.on('exit', () => {
  bot.storage.saveAll()
  loaded && bot.destroy()
})

bot.on('error', logger.severe)

bot.on('warn', logger.warn)

bot.on('disconnect', event => {
  if (event.code === 4004) {
    logger.info('Disconnected from Discord (4004: invalid token)')
    // NOTE: Shutdown bot
    process.exit(1)
  } else {
    logger.severe(`Disconnected from Discord ${event.code === 1000 ? 'cleanly' : `with code ${event.code}`}`)
    // NOTE: Restart bot
    process.exit(42)
  }
})

process.on('uncaughtException', err => {
  logger.severe(`Uncaught Exception:\n${err.stack}`)
})

process.on('unhandledRejection', err => {
  logger.severe(`Uncaught Promise error:\n${err.stack}`)
})

const init = async () => {
  try {
    await Managers.Migrator.migrate(bot, __dirname)

    if (config) {
      beginTime = process.hrtime()
      logger.info('Logging in\u2026')
      await bot.login(config.botToken)
    }
  } catch (err) {
    console.error(err)
    process.exit(1)
  }
}

init()
