const saurus = require('saurus')

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, ['a'])

  if (!parsed.leftover.length) {
    throw new Error('You must specify something to search!')
  }

  const antonyms = parsed.options.a
  const query = parsed.leftover.join(' ')
  const y = 'Thesaurus.com'

  await msg.edit(`${PROGRESS}Searching for \`${query}\` on ${y}\u2026`)
  const res = await saurus(query)

  if (!res) {
    throw new Error('No matches found!')
  }

  if (antonyms && (!res.antonyms || !res.antonyms.length)) {
    throw new Error(`No antonyms found for \`${query}\``)
  } else if (!antonyms && (!res.synonyms || !res.synonyms.length)) {
    throw new Error(`No synonyms found for \`${query}\``)
  }

  return msg.edit(`First search result of \`${query}\` on ${y}:`, { embed:
    bot.utils.embed(
      `${antonyms ? 'Antonyms' : 'Synonyms'} of ${query}`,
      (antonyms ? res.antonyms : res.synonyms).join(', '), [],
      {
        footer: y,
        footerIcon: 'https://a.safe.moe/VhreL.png',
        color: '#fba824'
      }
    )
  })
}

exports.info = {
  name: 'thesaurus',
  usage: 'thesaurus [options] <query>',
  description: 'Looks up a word on Thesaurus.com (showing synonyms by default)',
  aliases: ['syn', 'synonyms'],
  options: [
    {
      name: '-a',
      usage: '-a',
      description: 'Shows antonyms instead'
    }
  ]
}
