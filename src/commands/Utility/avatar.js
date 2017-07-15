exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['e', 'np', 'ng'])

  if (msg.guild && parsed.options.e) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const keyword = parsed.leftover.join(' ')

  const get = bot.utils.getUser(msg.guild, keyword, msg.author)
  const user = get[0]
  const member = msg.guild ? msg.guild.member(user) : null

  let avatarURL = user.displayAvatarURL
  if (parsed.options.np) {
    avatarURL = avatarURL.replace('cdn.discordapp.com', 'images.discordapp.net')
  }

  let options = {}
  if (parsed.options.e) {
    options.embed = bot.utils.embed('', `[Direct link](${avatarURL})`, [], { image: avatarURL })
  }

  return msg.edit(
    `${get[1] ? user : user.tag}'s avatar:${parsed.options.e ? '' : `\n${avatarURL}`}` +
    `${member || !msg.guild ? '' : '\n*This user is not a member of the current guild.*'}`,
    options
  )
}

exports.info = {
  name: 'avatar',
  usage: 'avatar [user]',
  description: 'Gets yours or another user\'s avatar',
  aliases: ['ava'],
  options: [
    {
      name: '-e',
      usage: '-e',
      description: 'Shows avatar in embed'
    },
    {
      name: '-np',
      usage: '-np',
      description: 'Attempts to use the direct URL instead of the proxy URL'
    }
  ]
}
