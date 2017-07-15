exports.run = async (bot, msg) => {
  if (msg.mentions.users.size < 1) {
    throw new Error('@mention some people to feed!')
  }

  return msg.edit(msg.mentions.users.map(m => {
    return `*forces ${bot.consts.foods[Math.round(Math.random() * (bot.consts.foods.length - 1))]} down ${m}'s throat*`
  }).join('\n'))
}

exports.info = {
  name: 'feed',
  usage: 'feed <user-1> [user-2] ... [user-n]',
  description: 'Force a food item down some users\' throat'
}
