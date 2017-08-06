const snekfetch = require('snekfetch')
const moment = require('moment')
const mathjs = require('mathjs')

exports.fixerIoLatest = null
exports.fixerIoTimestamp = null

const STAT_ID = 'currencyTimeout'

const REFRESH = /^r(efresh)?$/i

exports.init = async bot => {
  this._stats = bot.managers.stats
  try { this.updateRates() } catch (err) { console.error(err) }
}

exports.updateRates = async () => {
  const prev = this._stats.get(STAT_ID)
  if (prev) {
    clearTimeout(prev)
  }

  const res = await snekfetch.get('https://api.fixer.io/latest')
  if (!res || !res.body) {
    throw new Error('Could not fetch exchange rates info!')
  }
  this.fixerIoLatest = res.body
  this.fixerIoTimestamp = new Date()

  // NOTE: Next day, 17:00 UTC+1 (5PM CET)
  const time = moment().startOf('day').add(1, 'd').set('h', 17).valueOf() - this.fixerIoTimestamp
  this._stats.set(STAT_ID, setTimeout(self => self.updateRates(), time, this))
}

exports.run = async (bot, msg, args) => {
  if (args.length && REFRESH.test(args[0])) {
    await msg.edit('🔄\u2000Refreshing exchange rates information\u2026')
    await this.updateRates()
    return msg.success('Successfully refreshed exchange rates information!')
  }

  if (args.length < 3) {
    throw new Error(`Usage: \`${config.prefix}${this.info.name} <value> <from> <to>\``)
  }

  if (!this.fixerIoLatest) {
    await msg.edit('🔄\u2000Missing exchange rates information! Fetching\u2026')
    await this.updateRates()
  }

  const value = parseFloat(args[0])
  if (isNaN(value)) {
    throw new Error('Invalid value. It must only be numbers!')
  }

  const base = this.fixerIoLatest.base
  const rates = this.fixerIoLatest.rates
  const from = args[1].toUpperCase()
  const to = args[/^to$/i.test(args[2]) && args.length > 3 ? 3 : 2].toUpperCase()
  for (const c of [from, to]) {
    if (!rates[c] && c !== base) {
      throw new Error(`Currency \`${c}\` is not available!`)
    }
  }

  const result = (from === base ? value : value / rates[from]) * (to === base ? 1 : rates[to])
  return msg.edit(`💸\u2000|\u2000${mathjs.round(value, 2).toLocaleString()} ${from} = ` +
    `**${mathjs.round(result, 2).toLocaleString()} ${to}**`)
}

exports.info = {
  name: 'currency',
  usage: 'currency [<value> <from> <to>|refresh]',
  description: 'Convert currency using exchange rates from http://fixer.io/',
  aliases: ['curr']
}
