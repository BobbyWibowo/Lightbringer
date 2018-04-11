/*
 * Worthless if timezone is all DuckDuckGo's API can do.
 * I'll look into more usage in the near future.
 */

const snekfetch = require('snekfetch')

exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!args.length) {
    return msg.error('You must specify a time to convert')
  }

  const input = args.join(' ')
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(input)}&format=json`

  const res = await snekfetch.get(url)
  if (res.status !== 200) {
    return msg.error('Could not connect to DuckDuckGo server!')
  }

  const data = JSON.parse(res.body)
  const answer = data['Answer']

  if (data['AnswerType'] === 'timezone_converter') {
    const matches = input.match(/(.*?)\s*(to|in)\s*(.*)/)
    let prefix

    if (matches) {
      prefix = matches[1]
    } else {
      prefix = input
    }

    return msg.edit({
      embed: bot.utils.embed('Timezone', `${prefix} ➔\u2000${answer}`, [], {
        footer: 'Powered by DuckDuckGo',
        footerIcon: 'https://the.fiery.me/APbw.png',
        color: '#df4e26'
      })
    })
  } else {
    return msg.error(`No conversion found for ${input}`)
  }
}

exports.info = {
  name: 'timezone',
  usage: 'timezone <time> to <time>',
  description: 'Converts between timezones using DuckDuckGo searches',
  credits: 'Abyss#0473 (136641861073764352)'
}
