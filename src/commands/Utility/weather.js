const snekfetch = require('snekfetch')
const dotProp = require('dot-prop')
const { stripIndents } = require('common-tags')

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, ['i'])

  if (!parsed.leftover.length) {
    throw new Error('You must specify a location!')
  }

  const keyword = parsed.leftover.join(' ')

  await msg.edit('🔄\u2000Fetching weather information from Yahoo! Weather\u2026')
  const res = await snekfetch.get('https://query.yahooapis.com/v1/public/yql?q=' +
    'select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where' +
    `%20text%3D%22${keyword}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`)

  if (!res || !dotProp.has(res, 'body.query.results.channel')) {
    throw new Error(`Could not get weather information of \`${keyword}\`!`)
  }

  const weather = res.body.query.results.channel

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

  return msg.edit(`Weather information for the location which matched the keyword \`${keyword}\`:`, { embed:
    bot.utils.formatEmbed('', stripIndents`
      **Current conditions:** ${weather.item.condition.text} (${weather.item.pubDate})
      **Sunrise:** ${weather.astronomy.sunrise}
      **Sunset:** ${weather.astronomy.sunset}
      **Coordinates:** ${weather.item.lat}, ${weather.item.long}

      **Forecasts:**
      ${weather.item.forecast.map(f =>
        `${f.day}, ${f.date} – ${f.text} – ${formatTemp(f.low)} ~ ${formatTemp(f.high)}`
      ).join('\n')}`, [
        {
          title: 'Wind',
          fields: [
            {
              name: 'Chill',
              value: formatTemp(weather.wind.chill)
            },
            {
              name: 'Direction',
              value: `${weather.wind.direction}°`
            },
            {
              name: 'Speed',
              value: formatSpeed(weather.wind.speed)
            }
          ]
        },
        {
          title: 'Atmosphere',
          fields: [
            {
              name: 'Humidity',
              value: `${weather.atmosphere.humidity}%`
            },
            {
              name: 'Pressure',
              value: `${weather.atmosphere.pressure} hPa`
            },
            {
              name: 'Visibility',
              value: `${weather.atmosphere.visibility}%`
            }
          ]
        }
      ],
      {
        author: {
          name: weather.title,
          icon: 'https://a.safe.moe/RElH8.png'
        },
        color: '#410093',
        inline: true
      }
    )
  })
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
