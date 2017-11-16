exports.run = async (bot, msg, args) => {
  const count = parseInt(args[0]) || 1

  let messages = await msg.channel.fetchMessages({
    limit: Math.min(count, 100),
    before: msg.id
  })

  messages = messages.filter(m => m.author.id === bot.user.id)

  if (!messages.size) {
    return msg.error('There are no messages that can be deleted by user!')
  }

  await msg.edit(`${consts.p}Pruning ${messages.size} message(s)\u2026`)
  await Promise.all(messages.map(m => m.delete()))

  return msg.success(`Pruned \`${messages.size}\` message(s)!`, 3000)
}

exports.info = {
  name: 'prune',
  usage: 'prune [amount]',
  description: 'Deletes a certain number of messages sent by you'
}
