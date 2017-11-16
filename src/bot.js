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

const logger = bot.logger = new Managers.Logger(bot)
logger.inject()

const configManager = bot.managers.config = new Managers.Config(bot, __dirname)
const config = bot.config = configManager.load()
const storage = bot.storage = new Managers.Storage()
const commands = bot.commands = new Managers.CommandManager(bot)
const stats = bot.managers.stats = new Managers.Stats(bot)

/*
 * Settings folders
 */

const settings = global.settings = {
  dataFolder: path.resolve(__dirname, '..', 'data'),
  configsFolder: path.resolve(__dirname, '..', 'data', 'configs')
}

if (!fse.existsSync(settings.dataFolder)) {
  fse.mkdirSync(settings.dataFolder)
}

if (!fse.existsSync(settings.configsFolder)) {
  fse.mkdirSync(settings.configsFolder)
}

/*
 * States
 */

let loggedIn
let initiated

/*
 * Bot Events
 */

bot.on('ready', async () => {
  if (initiated) {
    // Previously the bot would go retard-mode after the connection
    // was resumed. By not doing anything else but sending status
    // message will hopefully solve the retarded-ness.
    // This has not been tested thoroughly.
    const m = 'Connection resumed!'
    logger.info(m)

    if (config.statusChannel) {
      bot.channels.get(config.statusChannel).send(`${consts.s}${m}`)
    }
  } else {
    loggedIn = true
    setProcessTitle(bot.user.tag)

    logger.info('Logged in! Loading modules\u2026')

    // These lines will likely solve issue of mobile clients
    // not receiving push notifications.
    // This will also cause your user to appear as offline
    // whenever you're NOT viewing Discord with the Discord
    // clients (PC, mobile, etc.) -- meaning, your user will
    // actually be online in this bot, but everyone else will
    // see you as offline.
    // So, set "skipStatusUpdate" in config.json to true if you
    // want everyone else to see you as online whenever the bot
    // is online even when you're not viewing Discord.
    if (!config.skipStatusUpdate) {
      await bot.user.setStatus('online')
      await bot.user.settings.update(Discord.Constants.UserSettingsMap.status, 'online')
      await bot.user.setAFK(true)
    }

    bot.parentDir = path.resolve(__dirname, '../..')
    bot.srcDir = __dirname

    global.consts = bot.consts = require('./consts.js')
    bot.utils = require('./utils')

    bot.commandsDir = path.resolve(__dirname, 'commands')
    await commands.loadCommands(bot.commandsDir)

    logger.info(stripIndents`
    Stats:
    - User: ${bot.user.tag} (ID: ${bot.user.id})
    - Channels: ${bot.channels.size.toLocaleString()}
    - Guilds: ${bot.guilds.size.toLocaleString()}
    - Modules : ${commands._count.toLocaleString()}
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

    const m = 'Bot is ready!'
    console.log(m)

    if (config.statusChannel) {
      bot.channels.get(config.statusChannel).send(`${consts.s}${m}`)
    }

    initiated = true
  }
})

bot.on('message', msg => {
  stats.increment(`messages-${bot.user.id === msg.author.id ? 'sent' : 'received'}`)

  // Push all received msg to logMention()
  logMention(msg)

  // Ignore if the msg was NOT sent by the bot's owner/user
  if (msg.author.id !== bot.user.id) {
    return
  }

  // Ignore if the msg was sent in a blacklisted server
  if (msg.guild && config.blacklistedServers && config.blacklistedServers.includes(msg.guild.id)) {
    return
  }

  // Ignore if the msg did NOT start with the bot's prefix
  if (!msg.content.toLowerCase().startsWith(config.prefix.toLowerCase())) {
    return
  }

  // Push msg that passed all the previous filters to parseCommand()
  parseCommand(msg)
})

bot.on('messageUpdate', (old, msg) => {
  // Push all updated msg to logMention()
  logMention(msg)
})

bot.on('userUpdate', (old, user) => {
  // Update process title whenever the bot's owner/user changes username
  if (old && user && (user.id === bot.user.id)) {
    setProcessTitle(bot.user.tag)
  }
})

bot.on('error', console.error)

bot.on('warn', console.warn)

bot.on('disconnect', e => {
  const prefix = 'Disconnected from Discord'

  if (e.code === 4004) {
    console.error(`${prefix} (4004: Invalid token)`)
  } else {
    console.warn(`${prefix} ${e.code === 1000 ? 'cleanly' : `with code ${e.code}`}`)
  }
})

/*
 * Process Events
 */

process.on('uncaughtException', err => {
  console.error(`Uncaught Exception:\n${err.stack}`)
})

process.on('unhandledRejection', err => {
  console.error(`Unhandled Rejection (Promise):\n${err.stack}`)
})

process.on('exit', () => {
  storage.saveAll()
  loggedIn && bot.destroy()
})

/*
 * Functions
 */

const setProcessTitle = subtitle => {
  const title = `Lightbringer - ${subtitle}`
  process.title = title
  process.stdout.write(`\u001B]0;${title}\u0007`)
}

const parseCommand = async msg => {
  const DELETE = 8000
  const prefix = config.prefix.toLowerCase()
  const split = msg.content.substr(prefix.length).split(' ')

  let base = split[0].toLowerCase()
  if (!base) {
    return
  }

  if (stats.get('RELOADING')) {
    await msg.edit(`${consts.e}The bot is reloading modules!`)
    return msg.delete(DELETE)
  }

  let args = split.slice(1)

  let command = commands.get(base)
  if (command) {
    return commands.execute(msg, command, args)
  }

  const shortcut = storage('shortcuts').get(base)

  if (shortcut) {
    base = shortcut.command.split(' ')[0].toLowerCase()
    args = shortcut.command.split(' ').splice(1).concat(args)

    command = commands.get(base)
    if (command) {
      return commands.execute(msg, command, args)
    } else {
      await msg.edit(`${consts.e}The shortcut \`${shortcut.name}\` is improperly set up!`)
      return msg.delete(DELETE)
    }
  }

  const maybe = didYouMean(base, commands.all().map(c => c.info.name), {
    threshold: 5,
    thresholdType: 'edit-distance'
  })

  if (maybe) {
    await msg.edit(`${consts.q}Did you mean \`${prefix}${maybe}\`?`)
  } else {
    await msg.edit(`${consts.e}No commands were found that were similar to \`${prefix}${base}\``)
  }

  return msg.delete(DELETE)
}

const logMention = msg => {
  // Filter to check whether the bot's user/owner was mentioned
  if (!((msg.guild && msg.isMemberMentioned(msg.guild.me)) || msg.isMentioned(bot.user))) {
    return
  }

  stats.increment('mentions')

  // Skip if there is no channel set for mention logging or
  // if the "quote" command is missing ("q" is an alias)
  if (!config.mentionLogChannel || !commands.get('q')) {
    return
  }

  const log = msg.guild ? storage('mentions').get(msg.guild.id) : true

  // Skip if the guild was not whitelisted for mention logging
  if (!log) {
    return
  }

  // Send to "quote" command
  commands.execute(undefined, commands.get('q'), ['-c'], {
    msg,
    channel: msg.channel,
    target: bot.channels.get(config.mentionLogChannel)
  })
}

/*
 * Init
 */

// Login if config file
// exists and has a token
if (config && config.botToken) {
  logger.info('Logging in\u2026')
  bot.login(config.botToken).catch(err => {
    console.error(err)
    process.exit(1)
  })
}
