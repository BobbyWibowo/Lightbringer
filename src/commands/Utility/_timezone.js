const snekfetch = require('snekfetch')

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  if (!args.length) {
    throw new Error('You must specify a time to convert')
  }

  const input = args.join(' ')
  const url = `https://api.duckduckgo.com/?q=${encodeURIComponent(input)}&format=json`

  const res = await snekfetch.get(url)
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
        footerIcon: 'https://a.safe.moe/N2qMW.png',
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
