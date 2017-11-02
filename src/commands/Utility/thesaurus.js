const saurus = require('saurus')

exports.run = async (bot, msg, args) => {
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, ['a'])

  if (!parsed.leftover.length) {
    return msg.error('You must specify something to search!')
  }

  const antonyms = parsed.options.a
  const query = parsed.leftover.join(' ')
  const y = 'Thesaurus.com'

  await msg.edit(`${PROGRESS}Searching for \`${query}\` on ${y}\u2026`)
  const res = await saurus(query)

  if (!res) {
    return msg.error('No matches found!')
  }

  if (antonyms && (!res.antonyms || !res.antonyms.length)) {
    return msg.error(`No antonyms found for \`${query}\``)
  } else if (!antonyms && (!res.synonyms || !res.synonyms.length)) {
    return msg.error(`No synonyms found for \`${query}\``)
  }

  let title = ` of ${query}`
  let description
  if (antonyms) {
    title = 'Antonyms' + title
    description = res.antonyms.join(', ')
  } else {
    title = 'Synonyms' + title
    description = res.synonyms.join(', ')
  }

  return msg.edit(`First search result of \`${query}\` on ${y}:`, {
    embed: bot.utils.embed(
      title,
      description,
      [],
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
