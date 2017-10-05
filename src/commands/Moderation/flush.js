exports.run = async (bot, msg, args) => {
  const count = parseInt(args[0]) || 1

  try {
    msg.delete()
    const messages = await msg.channel.fetchMessages({
      limit: Math.min(count, 100),
      before: msg.id
    })
    const flushable = messages.filter(m => m.author.bot)
    await Promise.all(flushable.map(m => m.delete()))
    const m = await msg.channel.send(`${SUCCESS}Flushed \`${flushable.size}\` messages.`)
    return m.delete(2000)
  } catch (err) {
    console.error(err)
  }
}

exports.info = {
  name: 'flush',
  usage: 'flush <amount>',
  description: 'Deletes messages sent by bots'
}
