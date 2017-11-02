exports.run = async (bot, msg, args) => {
  if (args.length < 2) {
    return msg.error('You must provide an emoji and an input text!')
  }

  // No need to check whether the first argument is an emoji or not
  return msg.edit(`${args[0]} ${args.slice(1).join(` ${args[0]} `)} ${args[0]}`)
}

exports.info = {
  name: 'weave',
  usage: 'weave <emoji> <text>',
  description: 'Weave an input text with a certain emoji'
}
