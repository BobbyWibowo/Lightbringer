exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, 'np')

  if (msg.guild && parsed.options.e) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const keyword = parsed.leftover.join(' ')

  const get = bot.utils.getUser(msg.guild, keyword, msg.author)
  const user = get[0]
  const member = msg.guild ? msg.guild.member(user) : null

  let avatarURL = user.displayAvatarURL

  if (!avatarURL) {
    throw new Error('Could not get display avatar of the specified user!')
  }

  if (parsed.options.np) {
    avatarURL = avatarURL.replace('cdn.discordapp.com', 'images.discordapp.net')
  }

  if (/\.gif\?size=\d*?$/.test(avatarURL)) {
    avatarURL += '&f=.gif'
  }

  let message = `${get[1] ? user : user.tag}'s avatar:${parsed.options.e ? '' : `\n${avatarURL}`}` +
    `${member || !msg.guild ? '' : '\n*This user is not a member of the current guild.*'}`

  return msg.edit(message)
}

exports.info = {
  name: 'avatar',
  usage: 'avatar [options] [user]',
  description: 'Gets yours or another user\'s avatar',
  aliases: ['ava'],
  options: [
    {
      name: '-np',
      usage: '-np',
      description: 'Attempts to use the direct URL instead of the proxy URL (workaround for image sometimes not loading)'
    }
  ]
}
