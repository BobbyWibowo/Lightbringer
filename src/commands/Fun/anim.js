exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, 'd:')

  if (parsed.leftover.length < 1) {
    throw new Error('Please provide some emojis to use!')
  }

  let frames = parsed.leftover
  const content = frames.join(' ')

  if (content.indexOf('|') > -1) {
    frames = content.split('|')
  }

  const delay = isNaN(parsed.options.d) ? 250 : parsed.options.d

  return bot.utils.playAnimation(msg, delay, frames)
}

exports.info = {
  name: 'anim',
  usage: 'anim [-d <delay>] <emoji> [emoji2] [...]',
  description: '"Animates" a series of emojis'
}
