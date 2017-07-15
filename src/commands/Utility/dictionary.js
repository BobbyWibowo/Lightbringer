const webdict = require('webdict')

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  if (!args.length) {
    throw new Error('You must specify something to search!')
  }

  const query = args.join(' ')
  const y = 'Dictionary.com'

  await msg.edit(`${PROGRESS}Searching for \`${query}\` on ${y}\u2026`)
  const resp = await webdict('dictionary', query)
  if (!resp || (parseInt(resp.statusCode) !== 200)) {
    throw new Error('No matches found!')
  }

  return msg.edit(`First search result of \`${query}\` on ${y}:`, {
    embed: bot.utils.embed(`${query} (${resp.type})`, resp.definition.join('\n'), [], {
      footer: 'Dictionary.com',
      footerIcon: 'https://a.safe.moe/9aRrL.png',
      color: '#4a8fca'
    })
  })
}

exports.info = {
  name: 'dictionary',
  usage: 'dictionary <query>',
  description: 'Looks up a word on Dictionary.com',
  aliases: ['dict']
}
