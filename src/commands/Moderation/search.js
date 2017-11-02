const Discord = require('discord.js')
const moment = require('moment')

exports.run = async (bot, msg, args) => {
  if (!msg.guild) {
    return msg.error('This command can only be used in a guild!')
  }

  const parsed = bot.utils.parseArgs(args, ['l:', 'c:', 's'])

  if (parsed.leftover.length < 1) {
    return msg.error('You must specify something to search!')
  }

  const content = parsed.leftover.join(' ')
  const options = {
    content,
    max: parseInt(parsed.options.l) || 25,
    excludes: [msg.id],
    nsfw: true
  }

  if (parsed.options.c) {
    options.channel = bot.utils.getChannel(parsed.options.c, msg.guild, true)
  }

  await msg.edit(`${PROGRESS}Searching for \`${content}\`\u2026`)

  const messages = await bot.utils.searchMessages(msg.guild, options)
  if (!messages.length) {
    return msg.error('No matches found!')
  }

  await msg.edit(`Search results of \`${content}\` (${messages.length}):`)

  let output

  if (parsed.options.s) {
    const stats = new Discord.Collection()

    messages.forEach(m => {
      if (!stats.has(m.author.tag)) {
        stats.set(m.author.tag, {
          tag: m.author.tag,
          count: 0
        })
      }
      stats.get(m.author.tag).count++
    })

    output = stats.sort((a, b) => {
      const count = b.count - a.count
      if (count) return count
      return a.tag.localeCompare(b.tag)
    }).map(s => `${s.tag} -- ${s.count}x`).join('\n')
  } else {
    output = messages.map(m => {
      return `${moment(m.createdAt).format('\\[DD/MM/YY] \\[HH:mm:ss]')} ${m.author.tag}: ` +
        `${m.content.replace(/`/g, '\u200B`')}`
    }).join('\n')
  }

  return bot.utils.sendLarge(msg.channel, output, {
    prefix: '```log\n',
    suffix: '\n```',
    cutOn: '\n'
  })
}

exports.info = {
  name: 'search',
  usage: 'search [options] <text>',
  description: 'Searches message in the currently viewed guild for some text',
  aliases: ['s'],
  options: [
    {
      name: '-l',
      usage: '-l <limit>',
      description: 'Sets the limit of search results'
    },
    {
      name: '-c',
      usage: '-c <channel>',
      description: 'Search from a specific channel'
    },
    {
      name: '-s',
      usage: '-s',
      description: 'Statistics mode'
    }
  ]
}
