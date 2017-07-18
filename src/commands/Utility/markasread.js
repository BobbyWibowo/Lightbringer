const ALL = /^a(ll)?$/i

exports.run = async (bot, msg, args) => {
  if (args.length && ALL.test(args[0])) {
    await msg.edit('🔄\u2000Marking all guilds as read\u2026 (this may take a few seconds)')
    const guilds = bot.guilds.array()
    for (const g of guilds) {
      await g.acknowledge()
      await bot.utils.sleep(200)
    }
    return msg.success(`Successfully marked \`${guilds.length}\` guild${guilds.length !== 1 ? 's' : ''} as read!`)
  }

  if (!args.length && !msg.guild) {
    throw new Error('This command can only be used in a guild!')
  }

  const guild = args.length ? bot.utils.getGuild(args.join(' ')) : msg.guild
  await guild.acknowledge()
  return msg.success(`Successfully marked guild \`${guild.name}\` as read!`)
}

exports.info = {
  name: 'markasread',
  usage: 'markasread [guild|all]',
  description: 'Mark this guild, a certain guild or all guilds as read',
  aliases: ['mar']
}
