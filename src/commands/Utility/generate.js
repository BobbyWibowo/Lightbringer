const COMMANDS = /^c(command(s)?)?$/i

exports.run = async (bot, msg, args) => {
  const action = args[0]

  if (COMMANDS.test(action)) {
    await msg.edit('🔄')

    let count = 0
    const formatted = {}
    const commands = bot.commands._commands

    for (let i = 0; i < commands.length; i++) {
      if (commands[i].info.hidden) {
        continue
      }

      const category = commands[i].info.category || 'Uncategorized'

      if (!formatted[category]) {
        formatted[category] = []
      }

      formatted[category].push(commands[i])
      count++
    }

    let content = `# Commands (${count})\n\n`

    for (const category of Object.keys(formatted)) {
      content += `## ${category} – ${formatted[category].length} command${count !== 1 ? 's' : ''}\n`

      formatted[category] = formatted[category].sort((a, b) => {
        return a.info.name.localeCompare(b.info.name)
      }).forEach(c => {
        content += `### \`${c.info.name}\`\n`
        content += `*Description:* \`${(c.info.description || 'N/A').replace(/`/g, '"')}\`\n`
        content += `*Usage:* \`${c.info.usage || 'N/A'}\`\n`

        if (c.info.aliases) {
          content += `*Aliases:* ${c.info.aliases.map(a => `\`${a}\``).join(', ')}\n`
        }

        if (c.info.credits) {
          content += `*Credits:* \`${c.info.credits}\`\n`
        }
      })

      content += '\n'
    }

    const url = await bot.utils.gists(content)
    return msg.success(`<${url}>`, { timeout: -1 })
  } else {
    throw new Error('That action is not valid!')
  }
}

exports.info = {
  name: 'generate',
  usage: 'generate <commands>',
  aliases: ['gen']
}
