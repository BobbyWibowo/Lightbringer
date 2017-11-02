exports.run = async (bot, msg) => {
  if (msg.mentions.users.size < 1) {
    return msg.error('@mention some people to shoot!')
  }

  return msg.edit(`**${bot.user.username} is on a killing spree!**\n` +
    msg.mentions.users.map(m => `${m} 🔫`).join('\n'))
}

exports.info = {
  name: 'shoot',
  usage: 'shoot <user>',
  description: 'Shoots the user you mention'
}
