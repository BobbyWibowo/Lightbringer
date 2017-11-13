exports.run = async (bot, msg, args) => {
  if (!msg.guild) {
    return msg.error('This command can only be used in a guild!')
  }

  bot.utils.assertEmbedPermission(msg.channel, msg.member)

  const parsed = bot.utils.parseArgs(args, ['r', 'o', 'f:'])

  if (parsed.leftover.length < 1) {
    return msg.error('You must specify a role name!')
  }

  const keyword = parsed.leftover.join(' ')
  const guild = parsed.options.f ? bot.utils.getGuild(parsed.options.f) : msg.guild
  const get = bot.utils.getGuildRole(guild, keyword)
  const role = get[0]
  const mention = get[1]

  await msg.edit(`${PROGRESS}Fetching role information\u2026`)

  const res = await bot.utils.fetchGuildMembers(guild, !parsed.options.r)
  let members = role.members

  if (parsed.options.o) {
    members = members.filter(m => {
      return (m.user === bot.user ? bot.user.settings.status : m.user.presence.status) !== 'offline'
    })
  }

  const message = mention
    ? `Members of ${keyword}:`
    : `Members of the role which matched the keyword \`${keyword}\`:`
  const membersMap = members.map(m => m.user.tag).sort((a, b) => a.localeCompare(b))

  return msg.edit(message, {
    embed: bot.utils.formatEmbed(
      `${role.name} (ID: ${role.id})`,
      `**---**\n**Guild:** ${guild.name} (ID: ${guild.id})\n` +
      (membersMap.includes(bot.user.tag) ? '*You are a member of this role.*\n' : '') +
      bot.utils.formatCode(membersMap.join(', '), 'css'),
      [],
      {
        color: role.hexColor,
        footer: res.time ? `Time taken to re-fetch members: ${res.time}` : ''
      }
    )
  })
}

exports.info = {
  name: 'inrole',
  usage: 'inrole [-r] <role name>',
  description: 'Shows a list of members which have the specified role',
  options: [
    {
      name: '-r',
      usage: '-r',
      description: 'Re-fetches all guild members (recommended with large guild)'
    },
    {
      name: '-o',
      usage: '-o',
      description: 'Lists online members only'
    },
    {
      name: '-f',
      usage: '-f <guild name>',
      description: 'Uses a certain guild instead'
    }
  ]
}
