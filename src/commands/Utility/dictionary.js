const { CollegiateDictionary, WordNotFoundError } = require('mw-dict')
const CONFIG_KEY_DICT = 'merriamWebsterDictKey'

exports.init = async bot => {
  if (bot.config[CONFIG_KEY_DICT]) {
    await initDictClient()
  }
}

const initDictClient = async () => {
  this.dictClient = await new CollegiateDictionary(bot.config[CONFIG_KEY_DICT])
  return true
}

exports.run = async (bot, msg, args) => {
  if (!bot.config[CONFIG_KEY_DICT]) {
    return msg.error(`Merriam-Webster Dictionary key (\`${CONFIG_KEY_DICT}\`) is missing from config.json file!`)
  }

  if (!this.dictClient) {
    await initDictClient()
  }

  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, 'i:')

  if (!parsed.leftover.length) {
    return msg.error('You must specify something to search!')
  }

  const query = parsed.leftover.join(' ')
  const y = 'Merriam-Webster'

  await msg.edit(`${PROGRESS}Searching for \`${query}\` on ${y}\u2026`)

  let resp
  try {
    resp = await this.dictClient.lookup(query)
  } catch (err) {
    if (err instanceof WordNotFoundError) {
      return msg.edit(`${FAILURE}\`${query}\` was not found!`, {
        embed: bot.utils.embed(
          `Suggestions`,
          err.suggestions.join('; '),
          [],
          {
            footer: y,
            color: '#ff0000'
          }
        )
      })
    } else {
      throw new Error(err)
    }
  }

  let index = 0
  if (parsed.options.i) {
    index = parseInt(parsed.options.i)

    if (isNaN(index)) {
      return msg.error('Index must be a number!')
    } else {
      index--
    }
  }

  const selected = resp[index]
  const embed = bot.utils.formatEmbed(
    `${selected.word}${selected.functional_label ? ` (${selected.functional_label})` : ''}`,
    selected.definition.map(d => {
      // All instances of .filter(d => d) used to filter out 'false' from skipping object in line 102
      if (d.meanings) {
        return _beautify(d, selected.word)
      } else if (d.senses) {
        return `**${d.number}:**\n${d.senses.map(s => {
          return `    ${_beautify(s, selected.word)}`
        }).filter(d => d.trim() !== 'false').join('\n')}`
      } else {
        console.log(require('util').inspect(d))
        return '**WARN:** Unexpected behavior for this definition. Check your console\u2026'
      }
    }).filter(d => d).join('\n'),
    [
      ['Link', `**https://www.merriam-webster.com/dictionary/${selected.word.replace(/ /g, '+')}**`],
      ['Match(es)', resp.map((l, i) => `**${i + 1}** : ${l.word}`).join('; ')]
    ],
    {
      footer: y,
      color: '#2d5f7c'
    }
  )

  return msg.edit(
    `Search result of \`${query}\` at index \`${index + 1}/${resp.length}\` on ${y}:`,
    { embed }
  )
}

const _beautify = (m, word) => {
  if (!m.meanings) {
    console.log(require('util').inspect(m))
    console.info('Skipping object for now\u2026')
    return false
  }

  let _temp = m.number ? `**${m.number}**${m.status ? ` *${m.status}*` : ''} : ` : ''

  _temp += m.meanings.map((m, i, a) => {
    if (i === 0 && m.startsWith(':')) {
      m = m.slice(2)
    } else if (i > 0 && !m.startsWith(':')) {
      m = `*${m}* `
    }

    if (i !== a.length - 1 && a[i + 1] !== undefined && !a[i + 1].startsWith(':')) {
      m += '; '
    }

    return m
  }).join('').trim()

  if (m.synonyms) {
    _temp += m.synonyms.map(s => `__${s}__`).join(', ')
  }

  if (m.illustrations) {
    _temp += m.illustrations.map(i => ` \u2022 ${i}`).join('')
  }

  return _temp.replace(new RegExp(`\\b${word}\\b`), `*${word}*`).trim()
}

exports.info = {
  name: 'dictionary',
  usage: 'dictionary [-i] <query>',
  description: 'Looks up a word on Merriam-Webster',
  aliases: ['dict'],
  options: [
    {
      name: '-i',
      usage: '-i <index>',
      description: 'Sets index of which definition to show'
    }
  ]
}
