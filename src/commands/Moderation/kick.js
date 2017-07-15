exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('Specify a user to kick!')
  }

  const keyword = args.join(' ')
  const get = bot.utils.getGuildMember(msg.guild, keyword)
  const member = get[0]

  await member.kick()
  return msg.success(`Successfully kicked \`${member.user.tag}\` from the currently viewed guild!`)
}

exports.info = {
  name: 'kick',
  usage: 'kick <user>',
  description: 'Kick a user'
}
