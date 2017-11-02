const snekfetch = require('snekfetch')
const moment = require('moment')
const googleMapsApi = 'https://maps.googleapis.com/maps/api'

exports.run = async (bot, msg, args) => {
  if (!config.googleApiKey || config.googleApiKey.length < 1) {
    return msg.error('Google API key is missing from config.json')
  }

  const location = args.join(' ') || config.defaultTimeZone || false
  if (!location) {
    return msg.error('Please specify a location to lookup!')
  }

  await msg.edit(`${SUCCESS}Fetching time info for '${location}' from Google Maps API\u2026`)

  const geocode = await snekfetch.get(`${googleMapsApi}/geocode/json?address=${encodeURIComponent(location)}` +
    `&key=${config.googleApiKey}`)

  if (geocode.status !== 200) {
    return msg.error('Could not fetch geocode data from Google Maps API!')
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
    `&timestamp=${unixTimestamp}&key=${config.googleApiKey}`)

  if (timezone.status !== 200) {
    return msg.error('Could not fetch timezone data from Google Maps API!')
  }

  // NOTE: This check may not actually exist in timezone API (exists in geocode API)
  if (timezone.body.error_message) {
    throw new Error(timezone.body.error_message)
  }

  // NOTE: This check may not actually exist in timezone API (exists in geocode API)
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
  usage: 'gtime [location]',
  description: 'Prints current time in yours or a particular location (using Google Maps API)'
}
