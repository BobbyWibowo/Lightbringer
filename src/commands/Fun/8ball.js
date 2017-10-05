const snekfetch = require('snekfetch')

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('You must provide something to ask!')
  }

  await msg.edit('🔄\u2000Asking 8-ball\u2026')
  const res = await snekfetch.get(`https://8ball.delegator.com/magic/JSON/${args.join(' ')}`)

  if (!res || !res.body || !res.body.magic) {
    throw new Error('Could not retrieve answer from 8-ball!')
  }

  const magic = res.body.magic
  return msg.edit(`🎱\u2000|\u2000**Question:** ${bot.utils.capitalizeFirstLetter(magic.question)}?\n\n` +
    `${magic.answer}, **${msg.member.displayName}**.`)
}

exports.info = {
  name: '8ball',
  usage: '8ball <question>',
  description: 'Uses 8ball.delegator.com to ask the magic 8-ball for a question',
  aliases: ['8b']
}
