exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['k'])
  parsed.split = parsed.leftover.join(' ').replace(/(<:\w+?:\d+?>)/g, '|$1|').split('|')

  if (parsed.split.length < 1) {
    throw new Error('You must enter at least one emoji!')
  }

  let files = parsed.split.map(a => {
    const emoji = bot.emojis.find(e => e.toString() === a)

    if (!emoji) {
      return null
    }

    return emoji
  }).filter(e => e)

  files.length = Math.min(10, files.length)
  files = files.map(e => {
    if (!parsed.options.k) {
      parsed.split.splice(parsed.split.indexOf(e.toString()), 1)
    }

    return {
      attachment: e.url,
      name: `${e.name}-${e.id}.png`
    }
  })

  if (!files.length) {
    throw new Error('Could not parse emojis!')
  }

  await msg.channel.send(parsed.split.join(''), { files })
  return msg.delete()
}

exports.info = {
  name: 'jumbo',
  usage: 'jumbo [-k] <emojis>',
  description: 'Sends the emojis as image attachments',
  aliases: ['j', 'large'],
  options: [
    {
      name: '-k',
      usage: '-k',
      description: 'Keep emojis in the chat content'
    }
  ]
}
