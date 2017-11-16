exports.run = async (bot, msg) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  /*
  return msg.edit('My guilds:', {
    embed: bot.utils.formatLargeEmbed('', `**Total:** ${bot.guilds.size}`,
      {
        delimeter: '\n',
        children: bot.guilds.sort((a, b) => b.memberCount - a.memberCount).map(g => {
          return `•\u2000**${g.name}** – ${g.memberCount} member${g.memberCount !== 1 ? 's' : ''}, ` +
            `${g.channels.size} channel${g.channels.size ? 's' : ''}`
        })
      },
      { inline: false }
    )
  })
  */

  return bot.utils.sendLarge(msg.channel,
    bot.guilds.sort((a, b) => b.memberCount - a.memberCount).map(g => `•\u2000**${g.name}** – ${g.memberCount} member${g.memberCount !== 1 ? 's' : ''}, ${g.channels.size} channel${g.channels.size ? 's' : ''}`),
    {
      cutOn: '\n'
    }
  )
}

exports.info = {
  name: 'guilds',
  usage: 'guilds',
  description: 'Lists all guilds that you\'re a member of',
  aliases: ['servers']
}
