const R_ADD = /^a(dd)?$|^c(reate)?$/i
const R_REMOVE = /^r(em(ove)?$)?$|^d(el(ete)?$)?$/i
const R_INFO = /^i(nfo)?$/i

exports.init = async bot => {
  this.storage = bot.storage('shortcuts')
}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['v'])

  if (parsed.leftover.length < 1) {
    if (!bot.utils.hasEmbedPermission(msg.channel)) {
      return msg.error('No permission to use embed in this channel!')
    }

    const shortcuts = this.storage.values

    if (shortcuts.length < 1) {
      return msg.error('You have no shortcuts!')
    }

    await msg.edit(msg.content, {
      embed: bot.utils.formatLargeEmbed(
        `Shortcuts [${shortcuts.length}]`,
        '*This message will self-destruct in 60 seconds.*',
        {
          delimeter: '\n',
          children: shortcuts.map(sc => {
            const prefix = `**${sc.name}:** \``
            return prefix + bot.utils.truncate(bot.utils.cleanCustomEmojis(sc.command),
              1024 - prefix.length - 1) + '`'
          })
        }
      )
    })
    return msg.delete(60000)
  }

  const action = parsed.leftover[0]

  if (R_ADD.test(action)) {
    if (parsed.leftover.length < 3) {
      return msg.error(`Usage: \`${bot.config.prefix}shortcuts add <name> <command>\``)
    }

    const name = parsed.leftover[1].toLowerCase()

    if (bot.commands.get(name)) {
      return msg.error(`That name \`${name}\` was already reserved by a module as a command or as an alias!`)
    }

    if (this.storage.get(name)) {
      return msg.error(`The shortcut \`${name}\` already exists!`)
    }

    let command = parsed.leftover.slice(2).join(' ')

    if (command.startsWith(bot.config.prefix)) {
      command = command.substr(bot.config.prefix.length)
    }

    this.storage.set(name, { name, command })
    this.storage.save()

    return msg.success(`The shortcut \`${name}\` was added!`)
  } else if (R_REMOVE.test(action)) {
    if (parsed.leftover.length < 2) {
      return msg.error(`Usage: \`${bot.config.prefix}shortcut remove <name>\``)
    }

    const name = parsed.leftover[1].toLowerCase()

    if (!this.storage.get(name)) {
      return msg.error(`The shortcut \`${name}\` does not exist!`)
    }

    this.storage.set(name)
    this.storage.save()

    return msg.success(`The shortcut \`${name}\` was deleted.`)
  } else if (R_INFO.test(action)) {
    if (parsed.leftover.length < 2) {
      return msg.error(`Usage: \`${bot.config.prefix}shortcut info <name>\``)
    }

    const name = parsed.leftover[1].toLowerCase()
    const shortcut = this.storage.get(name)

    if (!shortcut) {
      return msg.error(`The shortcut \`${name}\` does not exist!`)
    }

    await msg.edit(`**Name:** ${shortcut.name}\n${bot.utils.formatCode(shortcut.command, 'xl')}`)
    return msg.delete(30000)
  } else {
    return msg.error('That action is not valid!')
  }
}

exports.info = {
  name: 'shortcuts',
  usage: 'shortcuts [<create> <id> <commands>|<delete|info> <id>]',
  description: 'Controls or lists your shortcuts',
  aliases: ['sc', 'shortcut']
}
