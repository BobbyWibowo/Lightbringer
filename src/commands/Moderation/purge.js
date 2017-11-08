exports.run = async (bot, msg, args) => {
  const count = parseInt(args[0]) || 1

  let messages = await msg.channel.fetchMessages({
    limit: Math.min(count, 100),
    before: msg.id
  })

  if (!msg.guild || !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES')) {
    messages = messages.filter(m => m.author.id === bot.user.id)
  }

  if (!messages.size) {
    return msg.error('There are no messages that can be deleted by user!')
  }

  await msg.edit(`${PROGRESS}Purging ${messages.size} message(s)\u2026`)
  await Promise.all(messages.map(m => m.delete()))

  return msg.success(`Purged \`${messages.size}\` messages.`)
}
exports.info = {
  name: 'purge',
  usage: 'purge [amount]',
  description: 'Deletes a certain number of messages'
}
