exports.run = async (bot, msg, args) => {
  const count = parseInt(args[0]) || 1

  if (!msg.guild || !msg.channel.permissionsFor(msg.guild.me).has('MANAGE_MESSAGES')) {
    return msg.error('You do not have permission to flush messages by bots!')
  }

  let messages = await msg.channel.fetchMessages({
    limit: Math.min(count, 100),
    before: msg.id
  })

  messages = messages.filter(m => m.author.bot)

  if (!messages.size) {
    return msg.error('There are no messages that can be deleted by user!')
  }

  await msg.edit(`${PROGRESS}Flushing ${messages.size} message(s)\u2026`)
  await Promise.all(messages.map(m => m.delete()))

  return msg.success(`Flushed \`${messages.size}\` messages.`, 4000)
}

exports.info = {
  name: 'flush',
  usage: 'flush <amount>',
  description: 'Deletes messages sent by bots'
}
