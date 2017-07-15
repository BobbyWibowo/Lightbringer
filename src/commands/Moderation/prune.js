exports.run = async (bot, msg, args) => {
  const count = parseInt(args[0]) || 1

  try {
    msg.delete()
    const messages = await msg.channel.fetchMessages({
      limit: Math.min(count, 100),
      before: msg.id
    })
    const prunable = messages.filter(m => m.author.id === bot.user.id)
    await Promise.all(prunable.map(m => m.delete()))
    const m = await msg.channel.send(`${SUCCESS}Pruned \`${prunable.size}\` messages.`)
    return m.delete({ timeout: 2000 })
  } catch (err) {
    console.error(err)
  }
}

exports.info = {
  name: 'prune',
  usage: 'prune [amount]',
  description: 'Deletes a certain number of messages sent by you'
}
