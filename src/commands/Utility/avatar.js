const snekfetch = require('snekfetch')

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u', 'np'])

  if (msg.guild && parsed.options.e) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const keyword = parsed.leftover.join(' ')

  const get = bot.utils.getUser(msg.guild, keyword, msg.author)
  const user = get[0]
  const member = msg.guild ? msg.guild.member(user) : null

  let avatarURL = user.displayAvatarURL({ size: 2048 })

  if (!avatarURL) {
    throw new Error('Could not get display avatar of the specified user!')
  }

  if (parsed.options.np) {
    avatarURL = avatarURL.replace('cdn.discordapp.com', 'images.discordapp.net')
  }

  const message = `${get[1] ? user : user.tag}'s avatar:${parsed.options.e ? '' : `\n${avatarURL}`}` +
    `${member || !msg.guild ? '' : '\n*This user is not a member of the current guild.*'}`

  if (parsed.options.u) {
    await msg.edit(`${PROGRESS}Fetching avatar of the specified user\u2026`)
    const res = await snekfetch.get(avatarURL)
    if (!res || !res.body) {
      throw new Error('Failed to download avatar of the specified user!')
    }
    await msg.channel.send(message.replace(avatarURL, `<${avatarURL}>`), { files: [{
      attachment: res.body,
      name: avatarURL.match(/\/([^/?]+)(\?size=\d+)?$/)[1]
    }] })
    return msg.delete()
  } else {
    return msg.edit(message)
  }
}

exports.info = {
  name: 'avatar',
  usage: 'avatar [options] [user]',
  description: 'Gets yours or another user\'s avatar',
  aliases: ['ava'],
  options: [
    {
      name: '-u',
      usage: '-u',
      description: 'Attempts to upload avatar as an attachment instead (workaround for GIF not playing)'
    },
    {
      name: '-np',
      usage: '-np',
      description: 'Attempts to use the direct URL instead of the proxy URL ' +
        '(workaround for image sometimes not loading)'
    }
  ]
}
