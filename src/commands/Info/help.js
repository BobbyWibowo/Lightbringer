const { stripIndents } = require('common-tags')

const R_CATEGORY = /^c(ategory)?$|^type$/i
const R_ALL = /^a(ll)?$|^full$|^every$/i

exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  let commands = []
  let title = 'Categories'

  if (args.length > 0) {
    if (R_CATEGORY.test(args[0])) {
      if (args.length < 2) {
        return msg.error('You must specify a category!')
      }

      commands = bot.commands.all(args[1])
      title = `${args[1]} Commands`
    } else if (R_ALL.test(args[0])) {
      commands = bot.commands.all()
      title = 'All Commands'
    } else {
      const command = bot.commands.get(args[0])
      if (!command) {
        return msg.error(`The command \`${args[0]}\` does not exist!`)
      }

      commands = [command]
      title = `\`${command.info.name}\``
    }
  }

  if (commands.length > 1) {
    const filtered = commands.filter(c => !c.info.hidden).sort((a, b) => a.info.name.localeCompare(b.info.name))
    let maxLength = 0
    filtered.forEach(c => {
      if (maxLength < c.info.name.length) { maxLength = c.info.name.length }
    })

    await msg.edit('https://github.com/BobbyWibowo/Lightbringer/blob/master/COMMANDS.md')
    await bot.utils.sleep(200)
    return bot.utils.sendLarge(msg.channel,
      filtered.map(c => {
        return `${bot.utils.pad(' '.repeat(maxLength), c.info.name)} : ${c.info.description || '<no description>'}`
      }).join('\n'),
      {
        prefix: '```\n',
        suffix: '\n```',
        cutOn: '\n'
      }
    )
  } else if (commands.length) {
    const help = getHelp(commands[0])
    await msg.edit(msg.content, {
      embed: bot.utils.embed(
        help.name,
        `*This message will self-destruct in 60 seconds.*\n\n${help.value}`,
        [],
        {
          color: '#ff0000'
        }
      )
    })
    return msg.delete(60000)
  } else {
    const categories = bot.commands.categories().sort()
    await msg.edit(msg.content, {
      embed: bot.utils.embed(
        title,
        stripIndents`
          '*This message will self-destruct in 30 seconds.*'

          ❯\u2000**Available categories:**
          ${categories.map(c => `- __${c}__`).join('\n')}

          ❯\u2000**Usage:**
          •\u2000Do \`${bot.config.prefix}help category <name>\` for a list of commands in a specific category.
          •\u2000Do \`${bot.config.prefix}help all\` for a list of every command available in this bot.
          •\u2000Do \`${bot.config.prefix}help <command>\` for help with a specific command.
        `,
        [],
        {
          color: '#ff0000'
        }
      )
    })
    return msg.delete(30000)
  }
}

const getHelp = (command) => {
  let aliases = '<no aliases>'
  if (command.info.aliases) {
    aliases = command.info.aliases.map(a => `\`${bot.config.prefix}${a}\``).join(', ')
  }
  let description = stripIndents`
    •\u2000**Aliases:** ${aliases}
    •\u2000**Usage:** \`${bot.config.prefix}${command.info.usage || command.info.name}\`
    •\u2000**Category:** ${command.info.category}
    •\u2000**Description:** ${command.info.description || '<no description>'}`

  if (command.info.credits) {
    description += `\n•\u2000**Credits:** *${command.info.credits}*`
  }

  if (command.info.examples) {
    description += `\n\n•\u2000**Examples:**\n${command.info.examples.map(example => {
      return `-\u2000\`${bot.config.prefix}${example}\``
    }).join('\n')}`
  }

  if (command.info.options instanceof Array) {
    const options = command.info.options.map(option => {
      return stripIndents`
        •\u2000**${option.name}**
        *Usage:* \`${option.usage || option.name}\`
        *Description:* ${option.description}`
    })
    description += `\n\n❯\u2000**Options:**\n${options.join('\n')}`
  }

  return {
    name: command.info.name,
    value: description
  }
}

exports.info = {
  name: 'help',
  usage: 'help [all|command|category <name>]',
  description: 'Shows you help for all commands or just a single command',
  aliases: ['h']
}
