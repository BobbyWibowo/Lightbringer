exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('No texts provided to flip!')
  }

  const content = args.join(' ')

  const flipped = []
  for (const c of content) {
    flipped.push(bot.consts.flippedChars[c] || c)
  }

  return msg.edit(flipped.reverse().join(''))
}

exports.info = {
  name: 'flip',
  usage: 'flip <text>',
  description: 'Flip text',
  credits: '1Computer1'
}
