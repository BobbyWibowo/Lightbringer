const prompt = require('prompt')
const chalk = require('chalk')
const { stripIndents } = require('common-tags')
const moment = require('moment')

const fse = require('fs-extra')
const path = require('path')

prompt.message = ''
prompt.delimiter = chalk.green(' >')

const questions = {
  properties: {
    botToken: {
      pattern: /^"?[a-zA-Z0-9_.-]+"?$/,
      type: 'string',
      message: 'Token can only contain letters, numbers, underscores and dashes',
      required: true,
      hidden: true,
      replace: '*',
      before: value => value.replace(/"/g, '')
    },
    prefix: {
      type: 'string',
      default: 'lb',
      required: false
    }
  }
}

class ConfigManager {
  constructor (bot, base) {
    this.bot = bot
    this._base = base

    this._configPath = path.resolve(base, '../data/configs/config.json')
  }

  load () {
    if (!fse.existsSync(this._configPath)) {
      console.log(stripIndents`
        ${chalk.gray('---------------------------------------------------------')}
        ${chalk.gray('==============< ') + chalk.yellow('Lightbringer Setup Wizard') + chalk.gray(' >==============')}
        ${chalk.gray('---------------------------------------------------------')}

        To get your token, see the instructions at:
        ${chalk.green('https://github.com/BobbyWibowo/Lightbringer#getting-your-user-token')}

        Please enter your ${chalk.yellow('bot token')} and desired ${chalk.yellow('command prefix')} for the bot:
      `)

      prompt.get(questions, (err, res) => {
        if (err || !res) {
          if (err) {
            console.error(err)
          }
          process.exit(1)
        }

        res.blacklistedServers = res.blacklistedServers || [
          '226865538247294976',
          '239010380385484801',
          '272885620769161216'
        ]

        res.mentionLogChannel = ''
        res.statusChannel = ''
        res.malUser = ''
        res.malPassword = ''
        res.googleApiKey = ''
        res.defaultTimeZone = ''
        res.lastFmApiKey = ''
        res.lastFmUsername = ''
        res.pastebinApiDevKey = ''
        res.pastebinApiUserKey = ''
        res.githubGistsToken = ''

        fse.outputJsonSync(this._configPath, res, { spaces: 2 })
        process.exit(1)
      })
      return null
    }

    this._config = fse.readJSONSync(this._configPath)
    return this._config
  }

  _backup () {
    const backupPath = `${this._configPath}.${moment().format('DD-MM-YY-HH-mm-ss')}.bak`
    fse.copySync(this._configPath, backupPath)
    return backupPath
  }

  save () {
    const backupPath = this._backup()
    try {
      fse.outputJsonSync(this._configPath, this._config)
      fse.removeSync(backupPath)
    } catch (e) {
      this.bot.logger.severe('Failed to save config file!')
    }
  }

  set (key, value) {
    // NOTE: Convert to string if it's not a string already
    const realKey = `${key}`
    this._config[realKey] = value
    this.save()
  }
}

module.exports = ConfigManager
