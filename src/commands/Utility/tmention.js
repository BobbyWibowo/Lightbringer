exports.init = async bot => {
  this.storage = bot.storage('mentions')
}

exports.run = async (bot, msg, args) => {
  let guild = msg.guild

  if (args.length) {
    if (/^l(ist)?$/i.test(args[0])) {
      const mentions = this.storage.keys

      if (mentions.length < 1) {
        throw new Error('You are not logging mentions from any guilds!')
      }

      await msg.edit(msg.content, { embed:
        bot.utils.formatLargeEmbed(
          'Logging mentions from these guilds:',
          '*This message will self-destruct in 60 seconds.*',
          {
            delimeter: '\n',
            children: mentions.map(m => {
              const guild = bot.guilds ? bot.guilds.get(m) : false
              return `•\u2000${guild ? `**${guild.name}:** ` : ''}\`${m}\``
            }).sort((a, b) => {
              return a.localeCompare(b)
            })
          }
        )
      })
      return msg.delete(60000)
    } else {
      guild = bot.utils.getGuild(args.join(' '))
    }
  }

  if (!msg.guild) {
    throw new Error('This command is only available in guilds!')
  }

  const stored = this.storage.get(guild.id)

  if (stored) {
    this.storage.set(guild.id)
    this.storage.save()
    await msg.edit(`👍\u2000I will stop logging mentions from guild: \`${guild.name}\`!`)
  } else {
    this.storage.set(guild.id, true)
    this.storage.save()
    await msg.edit(`👌\u2000I will log mentions from guild: \`${guild.name}\`!`)
  }

  return msg.delete(8000)
}

exports.info = {
  name: 'tmention',
  usage: 'tmention [list]',
  description: 'Toggle mentions logger in this guild',
  aliases: ['togglemention']
}
