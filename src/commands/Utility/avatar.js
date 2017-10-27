exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['np', 'ne'])

  if (msg.guild && !parsed.options.ne) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const keyword = parsed.leftover.join(' ')

  const get = bot.utils.getUser(msg.guild, keyword, msg.author)
  const user = get[0]
  const member = msg.guild ? msg.guild.member(user) : null
  const mention = get[1]

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

  const message = !keyword.length
    ? 'My avatar:'
    : (mention ? `${user}'s avatar:` : `Avatar of the user which matched the keyword \`${keyword}\`:`)
  const description = `[Click here to view in a browser](${avatarURL})`
  const append = `${member || !msg.guild ? '' : '\n*This user is not a member of the current guild.*'}`

  if (parsed.options.ne) {
    return msg.edit(`${mention ? user : user.tag}'s avatar:\n${avatarURL}\n${append}`)
  } else {
    return msg.edit(message, {
      embed:
      bot.utils.embed(user.tag, description + append, [], {
        color: member ? member.displayColor : 0,
        image: avatarURL
      })
    })
  }
}

exports.info = {
  name: 'avatar',
  usage: 'avatar [options] [user]',
  description: 'Display full image size of yours or another user\'s avatar',
  aliases: ['ava'],
  options: [
    {
      name: '-np',
      usage: '-np',
      description: 'No proxy URL (e.i. use images.discordapp.com instead of cdn.discordapp.com - workaround for when Discord\'s CDNs do not work properly)'
    },
    {
      name: '-ne',
      usage: '-ne',
      description: 'No embed display (workaround for channels in which the user do not have permission to post embeds)'
    }
  ]
}
