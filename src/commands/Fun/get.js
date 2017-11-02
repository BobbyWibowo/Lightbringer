const snekfetch = require('snekfetch')
const txtgen = require('txtgen')
const { XmlEntities } = require('html-entities')

const apis = [
  {
    name: 'joke',
    regex: '^j(oke)?$|^dad(joke)?$',
    api: 'https://icanhazdadjoke.com/',
    prop: 'joke',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Lightbringer (https://github.com/BobbyWibowo/Lightbringer)'
    }
  },
  {
    name: 'chucknorris',
    regex: '^c(huck(norris)?)?$',
    api: 'http://api.icndb.com/jokes/random',
    prop: 'value.joke',
    decode: true
  },
  {
    name: 'pun',
    regex: '^p(un)?$',
    api: 'https://pun.andrewmacheret.com/',
    prop: 'pun'
  },
  {
    name: 'yomomma',
    regex: '^y(omomma)?$',
    api: 'http://api.yomomma.info/',
    jsonParse: true,
    prop: 'joke'
  },
  {
    name: 'datefact',
    regex: '^d(ate(fact)?)?$',
    api: 'http://numbersapi.com/random/date?json',
    prop: 'text'
  },
  {
    name: 'mathfact',
    regex: '^m(ath(fact)?)?$',
    api: 'http://numbersapi.com/random/math?json',
    prop: 'text'
  },
  {
    name: 'yearfact',
    regex: '^ye(ar(fact)?)?$',
    api: 'http://numbersapi.com/random/year?json',
    prop: 'text'
  },
  {
    name: 'sentence',
    regex: '^s(en(t(ence)?)?)?$',
    func: async () => txtgen.sentence()
  },
  {
    name: 'paragraph',
    regex: '^pa(ra(graph)?)?$',
    func: async () => txtgen.paragraph()
  },
  {
    name: 'article',
    regex: '^a(rt(icle)?)?$',
    func: async () => txtgen.article()
  },
  {
    name: 'ifunny',
    regex: '^i(funny)?$|^me(me(s)?)?$',
    api: 'https://glaremasters.me/meme/generate.php',
    image: true
  }
]

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error(`You must specify a type! Use \`${bot.config.prefix}${this.info.name} list\` to see list of available APIs.`)
  }

  if (/^l(ist)?$/i.test(args[0])) {
    return msg.edit(`ℹ\u2000|\u2000**Available types for \`${this.info.name}\` command:** ${apis.map(a => `\`${a.name}\``).join(', ')}.`)
  }

  let result = {
    content: '',
    image: false
  }

  await msg.edit(`${PROGRESS}Fetching data\u2026`)
  for (const a of apis) {
    if (new RegExp(a.regex, 'i').test(args[0])) {
      if (a.api) {
        const res = await snekfetch.get(a.api).set(a.headers || {})

        if (res.status === 200) {
          const body = a.jsonParse ? JSON.parse(res.body) : res.body
          if (a.prop) {
            result.content = bot.utils.getProp(body, a.prop)
          } else {
            result.content = body
          }
        }

        if (!result.content) {
          return msg.error('Could not fetch data!')
        }
      } else {
        result.content = await a.func()
      }

      if (a.decode) {
        result.content = new XmlEntities().decode(result.content)
      }

      result.image = a.image === true

      break
    }
  }

  if (!result.content) {
    return msg.error('That type is not available!')
  }

  if (result.image) {
    await msg.channel.send({
      file: {
        attachment: result.content
      }
    })
  } else {
    await msg.channel.send(bot.utils.truncate(result.content, 2000))
  }

  return msg.delete()
}

exports.info = {
  name: 'get',
  usage: 'get [type|list]',
  description: 'Gets random thing from various APIs',
  aliases: ['g', 'f', 'fetch'],
  examples: [
    'get',
    'get list',
    'get joke'
  ]
}
