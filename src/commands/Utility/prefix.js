exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('Please provide a prefix to set!')
  }

  const prefix = args.join(' ')
  bot.managers.config.set('prefix', prefix)

  await msg.edit('Prefix set, rebooting! 👋')
  return process.exit(42)
}

exports.info = {
  name: 'prefix',
  usage: 'prefix <new prefix>',
  description: 'Sets the bot prefix'
}
