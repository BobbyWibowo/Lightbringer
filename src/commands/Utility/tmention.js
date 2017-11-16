exports.init = async bot => {
  this.storage = bot.storage('mentions')
}

exports.run = async (bot, msg, args) => {
  let id
  let name

  if (args.length) {
    if (/^l(ist)?$/i.test(args[0])) {
      const mentions = this.storage.keys

      if (mentions.length < 1) {
        return msg.error('You are not logging mentions from any guilds!')
      }

      await msg.edit(msg.content, {
        embed: bot.utils.formatLargeEmbed(`Logging mentions from these guilds [${mentions.length}]`, '',
          {
            delimeter: '\n',
            children: mentions.map(m => {
              const guild = bot.guilds ? bot.guilds.get(m) : null
              return `•\u2000${guild ? `**${guild.name}:** ` : ''}\`${m}\``
            }).sort((a, b) => {
              return a.localeCompare(b)
            })
          }
        )
      })

      return msg.delete(60000)
    } else if (args.length) {
      const _args = args.join(' ')
      const guild = bot.utils.getGuild(_args, true)
      if (guild) {
        id = guild.id
        name = guild.name
      } else if (/^\d+?$/.test(_args)) {
        id = name = _args
      }
    } else if (!msg.guild) {
      return msg.error('This command is only available in guilds when no arguments are provided!')
    }
  }

  const stored = this.storage.get(id)

  if (stored) {
    this.storage.set(id)
    this.storage.save()
    await msg.edit(`👍\u2000I will stop logging mentions from guild: \`${name}\`!`)
  } else {
    this.storage.set(id, true)
    this.storage.save()
    await msg.edit(`👌\u2000I will log mentions from guild: \`${name}\`!`)
  }

  return msg.delete(8000)
}

exports.info = {
  name: 'tmention',
  usage: 'tmention [list]',
  description: 'Toggle mentions logger in this guild',
  aliases: ['togglemention']
}
