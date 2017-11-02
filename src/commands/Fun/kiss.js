const snekfetch = require('snekfetch')

exports.run = async (bot, msg) => {
  if (msg.mentions.users.size < 1) {
    return msg.error('@mention someone to kiss!')
  }

  const res = await snekfetch.get('https://nekos.life/api/kiss').set('Key', 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf')

  return msg.edit(`*Kisses ${msg.mentions.users.first()}\u2026* ${res.body.url}`)
}

exports.info = {
  name: 'kiss',
  usage: 'kiss <user>',
  description: 'Kisses someone'
}
