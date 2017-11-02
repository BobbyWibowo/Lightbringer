// This command is cancerous!

exports.run = async (bot, msg, args) => {
  const emoji = bot.emojis.get('313010878196875265')

  if (!emoji) {
    return msg.error('You do not have the \'spongeMyCock\' emoji!')
  }

  const parsed = bot.utils.parseArgs(args, ['t:'])
  const channel = bot.utils.getChannel(parsed.leftover[1], msg.guild) || msg.channel

  let text
  if (parsed.options.t) {
    text = parsed.options.t
  } else {
    const m = await bot.utils.getMsg(channel, parsed.leftover[0], msg.id)
    text = m.content
  }

  return msg.edit(`${text.split('').map((a, i) => i % 2 ? a.toUpperCase() : a.toLowerCase()).join('')} ${emoji}`)
}

exports.info = {
  name: 'spongememe',
  usage: 'spongememe [-t] [id] [channel]',
  description: 'Turns a specific message into a SpongeBob meme (this command is cancerous!)',
  aliases: ['sm'],
  options: [
    {
      name: '-t',
      usage: '-t <text>',
      description: 'Specify a text instead'
    }
  ]
}
