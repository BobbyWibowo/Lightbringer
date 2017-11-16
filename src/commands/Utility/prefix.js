exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('Please specify a new prefix to change into!')
  }

  const old = bot.config.prefix
  const prefix = args.join(' ')
  bot.managers.config.set('prefix', prefix)

  return msg.success(`Prefix changed from \`${old}\` to \`${bot.config.prefix}\`!`)
}

exports.info = {
  name: 'prefix',
  usage: 'prefix <new>',
  description: 'Changes the bot prefix'
}
