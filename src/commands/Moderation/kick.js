exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['r:'])

  if (!parsed.leftover.length) {
    return msg.error('Specify a user to kick!')
  }

  const keyword = parsed.leftover.join(' ')
  const get = bot.utils.getGuildMember(msg.guild, keyword)
  const member = get[0]

  await member.kick(parsed.options.r || null)
  return msg.success(`Successfully kicked \`${member.user.tag}\` from the currently viewed guild!`)
}

exports.info = {
  name: 'kick',
  usage: 'kick <user>',
  description: 'Kicks a user',
  options: [
    {
      name: '-r',
      usage: '-r <reason>',
      description: 'Sets reason for the kick'
    }
  ]
}
