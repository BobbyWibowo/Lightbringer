const snekfetch = require('snekfetch')
const moment = require('moment')
const googleMapsApi = 'https://maps.googleapis.com/maps/api'

exports.init = async bot => {
  this.config = bot.config[this.info.name] || {}
}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, 'key:')

  if (parsed.options.key) {
    this.config.apiKey = parsed.options.key
    bot.managers.config.set(this.info.name, this.config)

    return msg.success('Successfully saved API key to the configuration file!')
  }

  if (!this.config.apiKey) {
    return msg.error(`Missing API key!\nGet your Google Maps Geocoding & Time Zone API key from **https://console.developers.google.com/project/_/apiui/apis/library** then use \`${bot.config.prefix}${this.info.name} -key <api key>\` to save the API key to the configuration file!`, -1)
  }

  const location = args.join(' ') || bot.config.defaultCity

  if (!location) {
    return msg.error('Please specify a location to lookup!')
  }

  await msg.edit(`${consts.s}Fetching time info for '${location}' from Google Maps\u2026`)

  const geocode = await snekfetch.get(`${googleMapsApi}/geocode/json?address=${encodeURIComponent(location)}` +
    `&key=${this.config.apiKey}`)

  if (geocode.status !== 200) {
    return msg.error('Could not fetch data from Google Maps Geocoding API!')
  }

  if (geocode.body.error_message) {
    throw new Error(geocode.body.error_message)
  }

  if (geocode.body.status !== 'OK') {
    throw new Error(geocode.body.status)
  }

  const geocodeloc = geocode.body.results[0].geometry.location
  const unixTimestamp = new Date().getTime() / 1e3

  const timezone = await snekfetch.get(`${googleMapsApi}/timezone/json?location=${geocodeloc.lat},${geocodeloc.lng}` +
    `&timestamp=${unixTimestamp}&key=${this.config.apiKey}`)

  if (timezone.status !== 200) {
    return msg.error('Could not fetch timezone data from Google Maps Time Zone API!')
  }

  // This check may not actually exist in timezone API (exists in geocode API)
  if (timezone.body.error_message) {
    throw new Error(timezone.body.error_message)
  }

  // This check may not actually exist in timezone API (exists in geocode API)
  if (timezone.body.status !== 'OK') {
    throw new Error(timezone.body.status)
  }

  const time = moment.unix(unixTimestamp + timezone.body.rawOffset)
  const clock = bot.consts.clocks[time.hour() % 12]

  return msg.edit(`${clock} The time in '${timezone.body.timeZoneId} (${timezone.body.timeZoneName})' is ` +
    `${time.format(bot.consts.fullDateFormat)}.`)
}

exports.info = {
  name: 'gtime',
  usage: 'gtime <location>',
  description: 'Prints current time in yours or a particular location (using Google Maps API)',
  aliases: ['googletime', 'googlet'],
  options: [
    {
      name: '-key',
      usage: '-key <api key>',
      description: 'Saves Google Maps Geocoding & Time Zone API to configuration file'
    }
  ]
}
