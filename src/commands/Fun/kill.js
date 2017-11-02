exports.run = async (bot, msg) => {
  if (msg.mentions.users.size < 1) {
    return msg.error('@mention some people to kill!')
  }

  return msg.edit(msg.mentions.users.map(m => {
    return `${bot.consts.kills[Math.round(Math.random() * (bot.consts.kills.length - 1))].replace(/@/g, m)}`
  }).join('\n'))
}

exports.info = {
  name: 'kill',
  usage: 'kill <user-1> [user-2] ... [user-n]',
  description: 'Kills some users',
  credits: 'illusorum#8235 (286011141619187712)'
}
