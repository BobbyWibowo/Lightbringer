const snekfetch = require('snekfetch')
const { stripIndents } = require('common-tags')

const WEATHER_ICONS = [
  { icon: '⛅', regex: /partly (cloudy|sunny)/i },
  { icon: '☁', regex: /cloudy/i },
  { icon: '☀', regex: /clear|sunny/i },
  { icon: '⛈', regex: /thunderstorms/i },
  { icon: '🌦', regex: /scattered showers/i },
  { icon: '🌧', regex: /rain/i }
]
const DAYS = {
  'Mon': 'Monday',
  'Tue': 'Tuesday',
  'Wed': 'Wednesday',
  'Thu': 'Thursday',
  'Fri': 'Friday',
  'Sat': 'Saturday',
  'Sun': 'Sunday'
}

exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  const parsed = bot.utils.parseArgs(args, ['i'])
  const keyword = parsed.leftover.join(' ') || bot.config.defaultCity

  if (!keyword) {
    return msg.error('Please specify a location to lookup!')
  }

  await msg.edit('🔄\u2000Fetching weather information from Yahoo! Weather\u2026')
  const res = await snekfetch.get(`https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${keyword}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`)
  if (res.status !== 200) {
    return msg.error('Could not connect to Yahoo server!')
  }

  if (typeof res.body !== 'object' || !res.body.query || !res.body.query.results || !res.body.query.results.channel) {
    return msg.error(`Could not get weather information of \`${keyword}\`!`)
  }

  const weather = res.body.query.results.channel

  const _location = []
  for (const k of ['city', 'region', 'country']) {
    if (weather.location[k]) { _location.push(weather.location[k].trim()) }
  }
  const location = _location.join(', ')

  const flag = weather.title.slice(-2).split('').map(i => {
    const e = bot.consts.emojiMap[i.toLowerCase()]
    return typeof e === 'object' ? e[0] : e
  }).join('')

  const formatCondition = text => {
    let icon = ''
    for (const wi of WEATHER_ICONS) {
      if (wi.regex.test(text)) {
        icon = `\u2000${wi.icon}`
        break
      }
    }
    return `**${text}**${icon}`
  }

  const formatTemp = value => {
    if (weather.units.temperature === 'F' && !parsed.options.i) {
      return `${((parseFloat(value) - 32) * 5 / 9).toFixed(0)} °C`
    } else if (weather.units.temperature === 'C' && parsed.options.i) {
      return `${(parseFloat(value) * 9 / 5 + 32).toFixed(0)} °F`
    } else {
      return `${parseInt(value)} °${weather.units.temperature}`
    }
  }

  const formatSpeed = value => {
    if (weather.units.speed === 'mph' && !parsed.options.i) {
      return `${(parseFloat(value) * 0.44704).toFixed(1)} mps`
    } else if (weather.units.speed === 'mps' && parsed.options.i) {
      return `${(parseFloat(value) * 2.2369).toFixed(1)} mph`
    } else {
      return `${parseInt(value)} ${weather.units.speed}`
    }
  }

  const formatClock = clock => {
    const matches = clock.match(/(\d{1,2}):(\d{1,2}) (am|pm)/i)
    const _ = i => i.length === 1 ? `0${i}` : i
    return `${_(matches[1])}:${_(matches[2])} ${matches[3].toUpperCase()}`
  }

  return msg.edit(
    `Weather information for the location which matched the keyword \`${keyword}\`:`,
    {
      embed: bot.utils.formatEmbed(
        '',
        stripIndents`
          ${flag}\u2000|\u2000**${location}**

          ${formatCondition(weather.item.condition.text)}

          **Temperature:** ${formatTemp(weather.item.condition.temp)}
          **Wind:** ${weather.wind.direction}° / ${formatSpeed(weather.wind.speed)}
          **Humidity:** ${weather.atmosphere.humidity}%
          **Pressure:** ${weather.atmosphere.pressure} hPa
          **Visibility:** ${weather.atmosphere.visibility}%
          **Sunrise:** ${formatClock(weather.astronomy.sunrise)} / **Sunset:** ${formatClock(weather.astronomy.sunset)}
          **Coordinates:** ${weather.item.lat}, ${weather.item.long}
          **Last update:** ${weather.item.pubDate}
        `,
        [
          {
            title: 'Forecasts',
            fields: weather.item.forecast.map(f => {
              return {
                name: '',
                value: `${DAYS[f.day]} – ${f.text} – ${formatTemp(f.low)} ~ ${formatTemp(f.high)}`
              }
            })
          }
        ],
        {
          color: '#410093',
          footer: 'Yahoo! Weather – Provided by The Weather Channel',
          footerIcon: 'https://the.fiery.me/ZSUt.png'
        }
      )
    }
  )
}

exports.info = {
  name: 'weather',
  usage: 'weather <city>',
  description: 'Shows you weather information of a particular city',
  options: [
    {
      name: '-i',
      usage: '-i',
      description: 'Attempt to convert units to imperial units (will use metric units by default)'
    }
  ]
}
