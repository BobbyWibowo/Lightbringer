const urban = require('relevant-urban')

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, ['i:'])
  const query = parsed.leftover.join(' ')
  let index = query.length ? parseInt(parsed.options.i) - 1 || 0 : -1

  const y = 'Urban Dictionary'
  const searchMessage = index >= 0
    ? `Searching for \`${query}\` on ${y}\u2026`
    : `Searching for random definition ${y}\u2026`

  await msg.edit(`${PROGRESS}${searchMessage}`)

  const defs = await (query.length ? urban.all(query) : urban.random())
  let def, total

  if (!defs) {
    return msg.error('No matches found!')
  }

  if (defs.constructor.name === 'Array') {
    // Results from urban.all(query)
    // TODO: Pull all pages then sort based on thumbs up / thumbs down ratio to find top definition
    total = Object.keys(defs).length

    if (!defs || !total) {
      return msg.error('No matches found!')
    }

    if (index >= total) {
      return msg.error(`Index is out of range (maximum index for this definition is ${total})`)
    }

    def = defs[index]
  } else if (defs.constructor.name === 'Definition') {
    // Results from urban.random()
    def = defs
    index = -1
  }

  const resultMessage = index >= 0
    ? `Search result of \`${query}\` at index \`${index + 1}${total ? `/${total}` : ''}\` on ${y}:`
    : `Random definition on ${y}:`

  return msg.edit(resultMessage, {
    embed: bot.utils.formatEmbed(`${def.word} by ${def.author}`, def.definition,
      [
        ['Example(s)', def.example ? def.example : 'N/A'],
        ['Rating', `👍\u2000${def.thumbsUp} | 👎\u2000${def.thumbsDown}`],
        ['Link', `**${def.urbanURL}**`]
      ],
      {
        footer: 'Urban Dictionary',
        footerIcon: 'https://a.safe.moe/1fscn.png',
        color: '#e86222'
      }
    )
  })
}

exports.info = {
  name: 'urban',
  usage: 'urban [options] [query]',
  description: 'Looks up a word on Urban Dictionary (leave query blank to get a random definition)',
  aliases: ['u', 'urbandictionary'],
  options: [
    {
      name: '-i',
      usage: '-i <index>',
      description: 'Sets index of which definition to show'
    }
  ]
}
