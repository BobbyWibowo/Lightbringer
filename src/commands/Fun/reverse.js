exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('You must input text to be reversed!')
  }

  return msg.edit(args.join(' ').split('').reverse().join(''))
}

exports.info = {
  name: 'reverse',
  usage: 'reverse <text>',
  description: 'Reverses the text you input'
}
