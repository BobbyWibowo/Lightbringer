exports.run = async (bot, msg, args) => {
  const count = parseInt(args[0]) || 1

  try {
    msg.delete()
    const messages = await msg.channel.fetchMessages({
      limit: Math.min(count, 100),
      before: msg.id
    })
    await Promise.all(messages.map(m => m.delete()))
    const m = await msg.channel.send(`${SUCCESS}Flushed \`${messages.size}\` messages.`)
    return m.delete({ timeout: 2000 })
  } catch (err) {
    console.error(err)
  }
}
exports.info = {
  name: 'purge',
  usage: 'purge [amount]',
  description: 'Deletes a certain number of messages'
}
