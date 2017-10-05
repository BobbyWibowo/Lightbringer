exports.run = async (bot, msg, args) => {
  const channel = bot.utils.getChannel(args[1], msg.guild) || msg.channel
  let amount = 5

  if (args[0]) {
    if (isNaN(parseInt(args[0]))) {
      throw new Error('Invalid amount. It must be numbers!')
    } else {
      amount = Math.min(50, parseInt(args[0]))
    }
  }

  let msgs = await channel.fetchMessages({
    limit: amount - 1,
    before: msg.id
  })
  msgs = msgs.array()

  msgs.unshift(msg)
  msgs.length = Math.min(amount, msgs.length)

  let i = 0
  const content = msgs.map(m => `${bot.utils.pad('  ', ++i)} : ${m.id}${m.id === msg.id ? ' [this]' : ''}`)

  return msg.edit(`IDs of the latest \`${amount}\` messages in \`${bot.utils.channelName(channel)}\`:` +
    `\n${bot.utils.formatCode(content.join('\n'))}`)
}

exports.info = {
  name: 'getids',
  usage: 'getids [amount] [channel]',
  description: 'Gets a list of message IDs'
}
