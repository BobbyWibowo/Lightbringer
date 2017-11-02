// Powered by http://nekos.life/

const snekfetch = require('snekfetch')
const LEWD = /^l(ewd)?$/

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])
  const isLewd = LEWD.test(args[0])
  await msg.edit('🔄\u2000Fetching a random nekos image\u2026')
  const res = await snekfetch.get(`http://nekos.life/api/${isLewd ? 'lewd/' : ''}neko`)

  if (res.status !== 200) {
    return msg.error('Failed to fetch image!')
  }

  if (parsed.options.u) {
    await msg.channel.send({ files: [res.body.neko] })
    return msg.delete()
  } else {
    return msg.edit(res.body.neko)
  }
}

exports.info = {
  name: 'nekos',
  usage: 'nekos [lewd]',
  description: 'Uses nekos.life to get random nekos image',
  aliases: ['neko'],
  options: [
    {
      name: '-u',
      usage: '-u',
      description: 'Attempts to send the image as an attachment instead'
    }
  ]
}
