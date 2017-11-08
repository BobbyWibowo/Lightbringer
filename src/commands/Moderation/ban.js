exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['r:', 'd:'])

  if (!parsed.leftover.length) {
    return msg.error('Specify a user to ban!')
  }

  let days = 0
  if (parsed.options.d) {
    days = parseInt(parsed.options.d)
    if (isNaN(days)) {
      return msg.error('Invalid value for days option. It must be numbers!')
    }
  }

  const keyword = parsed.leftover.join(' ')
  const get = bot.utils.getGuildMember(msg.guild, keyword)
  const member = get[0]

  await member.ban({ days, reason: parsed.options.r || null })
  return msg.success(`Successfully banned \`${member.user.tag}\` from the currently viewed guild!`)
}

exports.info = {
  name: 'ban',
  usage: 'ban <user>',
  description: 'Bans a user',
  options: [
    {
      name: '-r',
      usage: '-r <reason>',
      description: 'Sets reason for the ban'
    },
    {
      name: '-d',
      usage: '-d <days>',
      description: 'Sets number of days of messages to delete'
    }
  ]
}
