exports.init = async bot => {
  this.storage = bot.storage('mentions')
}

exports.run = async (bot, msg, args) => {
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
      return msg.delete({ timeout: 60000 })
    } else {
      throw new Error('That action is not valid!')
    }
  }

  if (!msg.guild) {
    throw new Error('This command is only available in guilds!')
  }

  const id = msg.guild.id
  const stored = this.storage.get(id)

  if (stored) {
    this.storage.set(id)
    this.storage.save()
    await msg.edit('👍\u2000I will stop logging mentions from this guild!')
  } else {
    this.storage.set(id, true)
    this.storage.save()
    await msg.edit('👌\u2000I will log mentions from this guild!')
  }

  return msg.delete({ timeout: 8000 })
}

exports.info = {
  name: 'tmention',
  usage: 'tmention [list]',
  description: 'Toggle mentions logger in this guild',
  aliases: ['togglemention']
}
