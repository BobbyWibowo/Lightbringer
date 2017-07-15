exports.run = async (bot, msg) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  await msg.edit(msg.content, { embed:
    bot.utils.formatLargeEmbed('', '*This message will self-destruct in 240 seconds.*',
      {
        delimeter: '\n',
        children: bot.guilds.sort((a, b) => b.memberCount - a.memberCount).map(g => {
          return `•\u2000**${g.name}** - ${g.memberCount} member${g.memberCount !== 1 ? 's' : ''}, ` +
            `${g.channels.size} channel${g.channels.size ? 's' : ''}`
        })
      },
      {
        inline: false,
        author: {
          name: `${bot.user.username}'s guilds [${bot.guilds.size}]`,
          icon: bot.user.displayAvatarURL
        }
      }
    )
  })
  return msg.delete(240000)
}

exports.info = {
  name: 'guilds',
  usage: 'guilds',
  description: 'Lists all guilds that you\'re a member of',
  aliases: ['servers']
}
