exports.run = async (bot, msg) => {
  await msg.edit('👋\u2000Restarting. See you!')
  return process.exit(42)
}

exports.info = {
  name: 'restart',
  usage: 'restart',
  description: 'Restarts the bot',
  aliases: ['res']
}
