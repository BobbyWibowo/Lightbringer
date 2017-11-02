const snekfetch = require('snekfetch')

exports.run = async (bot, msg) => {
  if (msg.mentions.users.size < 1) {
    return msg.error('@mention someone to pat!')
  }

  const res = await snekfetch.get('https://nekos.life/api/pat').set('Key', 'dnZ4fFJbjtch56pNbfrZeSRfgWqdPDgf')

  return msg.edit(`*Pats ${msg.mentions.users.first()}\u2026* ${res.body.url}`)
}

exports.info = {
  name: 'pat',
  usage: 'pat <user>',
  description: 'Pats someone (using random pat GIF from nekos.life)'
}
