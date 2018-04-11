const snekfetch = require('snekfetch')

const R_LIST = /^l(ist)?$/i

const CATEGORIES = [
  {
    name: 'all',
    regex: '^a(ll)?$'
  },
  {
    name: 'computers',
    regex: '^comp(uter(s)?)?$'
  },
  {
    name: 'cookie',
    regex: '^c(ookie)?$'
  },
  {
    name: 'definitions',
    regex: '^d(ef(inition(s)?)?)?$'
  },
  {
    name: 'miscellaneous',
    regex: '^m(isc(ellaneous)?)?$'
  },
  {
    name: 'people',
    regex: '^p(eople)?$'
  },
  {
    name: 'platitudes',
    regex: '^pla(t(itude(s)?)?)?$'
  },
  {
    name: 'politics',
    regex: '^poli(tic(s)?)?$'
  },
  {
    name: 'science',
    regex: '^s(cience)?$'
  },
  {
    name: 'wisdom',
    regex: '^w(isdom)?$'
  }
]

exports.run = async (bot, msg, args) => {
  let selected = ''

  if (args.length) {
    if (R_LIST.test(args[0])) {
      return msg.edit(`🔮\u2000|\u2000**Available types for \`${this.info.name}\` command:** ${CATEGORIES.map(c => `\`${c.name}\``).join(', ')}.`)
    } else {
      let valid = false
      for (const c of CATEGORIES) {
        if (new RegExp(c.regex, 'i').test(args[0])) {
          selected = c.name
          valid = true
          break
        }
      }
      if (!valid) {
        return msg.error('That type is not available!')
      }
    }
  }

  await msg.edit('🔄\u2000Getting a fortune cookie\u2026')
  const res = await snekfetch.get(`http://yerkee.com/api/fortune/${selected}`)

  if (res.status !== 200) {
    return msg.error('Could not retrieve fortune!')
  }

  await msg.edit(`🔮\u2000|\u2000**Fortune cookie${selected ? ` (${selected})` : ''}:**\n\n${res.body.fortune}`)
}

exports.info = {
  name: 'fortune',
  usage: 'fortune [category|list]',
  description: 'Shows a random fortune cookie',
  aliases: ['fortunecookie'],
  examples: [
    'fortune',
    'fortune list',
    'fortune computers',
    'fortune science'
  ]
}
