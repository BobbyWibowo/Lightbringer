const { CollegiateDictionary, WordNotFoundError } = require('mw-dict')

exports.init = async bot => {
  this.config = bot.config[this.info.name] || {}

  if (this.config.apiKey) {
    await initDictClient()
  }
}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['i:', 'm', 'key:'])

  if (parsed.options.key) {
    this.config.apiKey = parsed.options.key
    bot.managers.config.set(this.info.name, this.config)

    return msg.success('Successfully saved API key to the configuration file!')
  }

  if (!this.config.apiKey) {
    return msg.error(`Missing API key!\nGet your Merriam-Webster's Collegiate® Dictionary API key from **http://dictionaryapi.com/** then use \`${bot.config.prefix}${this.info.name} -key <api key>\` to save the API key to the configuration file!`, -1)
  }

  if (!this.dictClient) {
    await initDictClient()
  }

  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!parsed.leftover.length) {
    return msg.error('You must specify something to search!')
  }

  const query = parsed.leftover.join(' ')
  const source = 'Merriam-Webster'

  await msg.edit(`${consts.p}Searching for \`${query}\` on ${source}\u2026`)

  let resp
  try {
    resp = await this.dictClient.lookup(query)
  } catch (err) {
    if (err instanceof WordNotFoundError) {
      return msg.edit(`${consts.e}\`${query}\` was not found!`, {
        embed: bot.utils.embed(
          `Suggestions`,
          err.suggestions.join('; '),
          [],
          {
            footer: source,
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
  const nestedFields = [
    ['Link', `**https://www.merriam-webster.com/dictionary/${selected.word.replace(/ /g, '+')}**`]
  ]

  if (resp.length > 1 && parsed.options.m) {
    nestedFields.push([
      'More',
      resp.map((r, i) => i !== index ? `**${i + 1}** : ${r.word}` : false).filter(r => r).join('\n') +
      '\n\n*Use -i <index> to display definition of search result with a specific index.*'
    ])
  }

  const embed = bot.utils.formatEmbed(
    `${selected.word}${selected.functional_label ? ` (${selected.functional_label})` : ''}`,
    selected.definition.map(d =>
      // Italicize any word matching the currently defined word
      beautify(d).replace(new RegExp(`\\b${selected.word}\\b`), `*${selected.word}*`)
    ).join('\n'),
    nestedFields,
    {
      footer: `${source}'s Collegiate® Dictionary`,
      footerIcon: 'https://s.fiery.me/EuDU32BVAESNOfjYzLV9HMTZhfyBNYIH.png',
      color: '#2d5f7c'
    }
  )

  return msg.edit(
    `Search result of \`${query}\` at index \`${index + 1}/${resp.length}\` on ${source}:`,
    { embed }
  )
}

const initDictClient = async () => {
  this.dictClient = await new CollegiateDictionary(this.config.apiKey)
}

const beautify = (m, depth = 0) => {
  let temp = ''
  let hasContent = m.meanings || m.synonyms || m.illustrations || m.senses

  if (m.senses && (m.senses.findIndex(s => s.number === m.number) !== -1)) {
    // Skip current Sense if it has additional Senses
    // in which the current Sense exist
    // This is a workaround for a particular bug in mw-dict library
    return m.senses.map(s => beautify(s, depth)).join('\n')
  }

  temp += '    '.repeat(depth)

  if (m.number) {
    if (/^\(\d+?\)$/.test(m.number)) {
      temp += m.number + ' '
    } else {
      temp += `**${m.number}** `
    }
  }

  if (m.status) {
    temp += m.status + ' '
  }

  if (!hasContent) {
    // console.log(require('util').inspect(m))
    return temp + '*This meaning may not have any content. Check your console\u2026*'
  }

  if (m.meanings) {
    temp += m.meanings.map((m, i, a) => {
      // Trim whitespaces (some meanings have unexpected whitespace)
      m = m.trim()

      if (m.includes(':')) {
        // Format semicolons
        m = m.split(':').map(m => m.trim()).join(' : ').trim()
      } else {
        // Italicizes if the meaning does not start with a colon (:)
        m = `*${m}*`
      }

      // Starts meaning with a semicolon (;) if it does not start with
      // a colon (:) and there was a precedent meaning
      if (!m.startsWith(':') && a[i - 1] !== undefined) {
        m = `; ${m}`
      }

      return m
    }).join(' ')
  }

  if (m.synonyms) {
    // Adds an extra whitespace if there was
    // a meaning that ends with semicolon (;)
    if (temp.endsWith(':')) {
      temp += ' '
    }

    // Underlines all synonyms
    temp += m.synonyms.map(s => `__${s}__`).join(', ')
  }

  if (m.illustrations) {
    temp += ' ' + m.illustrations.map(i => `\u2022 ${i}`).join(' ')
  }

  if (m.senses) {
    depth++
    temp += '\n' + m.senses.filter((s, i, a) =>
      // Filter duplicate which have the same number but lack additional Senses
      // This is a workaround for a particular bug in mw-dict library
      a.findIndex(_s => (_s.number === s.number) && _s.senses && !s.senses) !== 1
    ).map(s => beautify(s, depth)).join('\n')
  }

  return temp.replace(/\s*$/g, '')
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
    },
    {
      name: '-m',
      usage: '-m',
      description: 'Adds More field which will list the rest of the search results if available'
    },
    {
      name: '-key',
      usage: '-key <api key>',
      description: 'Saves Merriam-Webster\'s Collegiate® Dictionary API key to configuration file'
    }
  ]
}
