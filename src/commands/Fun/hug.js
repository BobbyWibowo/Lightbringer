const snekfetch = require('snekfetch')

exports.run = async (bot, msg) => {
  if (msg.mentions.users.size < 1) {
    return msg.error('@mention someone to hug!')
  }

  const res = await snekfetch.get('https://nekos.life/api/hug').set('Key', 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf')

  return msg.edit(`*Hugs ${msg.mentions.users.first()}\u2026* ${res.body.url}`)
}

exports.info = {
  name: 'hug',
  usage: 'hug <user>',
  description: 'Hugs someone (using random hug GIF from nekos.life)'
}
