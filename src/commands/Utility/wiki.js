const wiki = require('wikijs').default

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, ['v'])

  if (parsed.leftover.length < 1) {
    throw new Error('You must specify something to search!')
  }

  const query = parsed.leftover.join(' ')

  await msg.edit(`${PROGRESS}Searching for \`${query}\` on Wikipedia\u2026`)

  const data = await wiki().search(query, 1)
  if (!data.results || !data.results.length) {
    throw new Error('No matches found!')
  }

  const page = await wiki().page(data.results[0])
  const summary = await page.summary()
  const paragraphs = summary.split('\n')

  if (!parsed.options.v) {
    paragraphs.length = Math.min(2, paragraphs.length)
  }

  const y = `Wikipedia${parsed.options.v ? ' (no paragraphs limit)' : ''}`

  return msg.edit(`First search result of \`${query}\` on ${y}:`, { embed:
    bot.utils.embed(page.raw.title, paragraphs.join('\n\n'),
      [
        {
          name: 'Link',
          value: `**${page.raw.fullurl}**`
        }
      ],
      {
        footer: 'Wikipedia',
        footerIcon: 'https://a.safe.moe/8GCNj.png',
        color: '#c7c8ca'
      }
    )
  })
}

exports.info = {
  name: 'wiki',
  usage: 'wiki <query>',
  description: 'Returns the summary of the first matching search result from Wikipedia',
  aliases: ['w', 'wikipedia'],
  options: [
    {
      name: '-v',
      usage: '-v',
      description: 'Verbose (shows as much paragraphs as possible - the bot will limit to 2 paragraphs by default)'
    }
  ]
}
