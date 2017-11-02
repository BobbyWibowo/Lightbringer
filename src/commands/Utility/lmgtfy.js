exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('You must specify something to search!')
  }

  const parsed = bot.utils.parseArgs(args, ['i'])

  return msg.edit(`**Wow!** ➔\u2000http://www.lmgtfy.com/?iie=${parsed.options.i ? 1 : 0}` +
    `&q=${parsed.leftover.join('+')}`)
}

exports.info = {
  name: 'lmgtfy',
  usage: 'lmgtfy [search text]',
  description: 'Links to LMGTFY with the given search text',
  options: [
    {
      name: '-i',
      usage: '-i',
      description: 'Enables Internet Explainer'
    }
  ]
}
