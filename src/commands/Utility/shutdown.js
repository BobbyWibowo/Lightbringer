exports.run = async (bot, msg) => {
  await msg.edit('👋\u2000Shutting down\u2026 See you next time!')
  return process.exit(0)
}

exports.info = {
  name: 'shutdown',
  usage: 'shutdown',
  description: 'Shuts down the bot (you\'ll have to manually start the bot later if you want to)',
  aliases: ['terminate', 'res', 'restart']
}
