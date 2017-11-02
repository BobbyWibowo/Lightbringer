exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('Please provide a prefix to set!')
  }

  const prefix = args.join(' ')
  bot.managers.config.set('prefix', prefix)

  return msg.success('Prefix saved! You will have to relaunch the bot for the change to take effect!')
}

exports.info = {
  name: 'prefix',
  usage: 'prefix <new prefix>',
  description: 'Sets the bot prefix'
}
