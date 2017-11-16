const snekfetch = require('snekfetch')
const txtgen = require('txtgen')
const { XmlEntities } = require('html-entities')

const R_LIST = /^l(ist)?$/i

const APIS = [
  {
    name: 'joke',
    regex: /^j(oke)?$|^dad(joke)?$/i,
    api: 'https://icanhazdadjoke.com/',
    prop: 'joke',
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'Lightbringer (https://github.com/BobbyWibowo/Lightbringer)'
    }
  },
  {
    name: 'chucknorris',
    regex: /^c(huck(norris)?)?$/i,
    api: 'http://api.icndb.com/jokes/random',
    prop: 'value.joke',
    decode: true
  },
  {
    name: 'pun',
    regex: /^p(un)?$/i,
    api: 'https://pun.andrewmacheret.com/',
    prop: 'pun'
  },
  {
    name: 'yomomma',
    regex: /^y(omomma)?$/i,
    api: 'http://api.yomomma.info/',
    jsonParse: true,
    prop: 'joke'
  },
  {
    name: 'datefact',
    regex: /^d(ate(fact)?)?$/i,
    api: 'http://numbersapi.com/random/date?json',
    prop: 'text'
  },
  {
    name: 'mathfact',
    regex: /^m(ath(fact)?)?$/i,
    api: 'http://numbersapi.com/random/math?json',
    prop: 'text'
  },
  {
    name: 'yearfact',
    regex: /^ye(ar(fact)?)?$/i,
    api: 'http://numbersapi.com/random/year?json',
    prop: 'text'
  },
  {
    name: 'sentence',
    regex: /^s(en(t(ence)?)?)?$/i,
    func: async () => txtgen.sentence()
  },
  {
    name: 'paragraph',
    regex: /^pa(ra(graph)?)?$/i,
    func: async () => txtgen.paragraph()
  },
  {
    name: 'article',
    regex: /^a(rt(icle)?)?$/i,
    func: async () => txtgen.article()
  },
  {
    name: 'ifunny',
    regex: /^i(funny)?$|^me(me(s)?)?$/i,
    api: 'https://glaremasters.me/meme/generate.php',
    image: true
  }
]

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error(`You must specify a type! Use \`${bot.config.prefix}${this.info.name} list\` to see list of available APIs.`)
  }

  if (R_LIST.test(args[0])) {
    return msg.edit(`ℹ\u2000|\u2000**Available types for \`${this.info.name}\` command:** ${APIS.map(A => `\`${A.name}\``).join(', ')}.`)
  }

  let result = {
    content: '',
    image: false
  }

  await msg.edit(`${consts.p}Fetching data\u2026`)
  for (const A of APIS) {
    if (A.regex.test(args[0])) {
      if (A.api) {
        const res = await snekfetch.get(A.api).set(A.headers || {})

        if (res.status === 200) {
          const body = A.jsonParse ? JSON.parse(res.body) : res.body
          if (A.prop) {
            result.content = bot.utils.getProp(body, A.prop)
          } else {
            result.content = body
          }
        }

        if (!result.content) {
          return msg.error('Could not fetch data!')
        }
      } else {
        result.content = await A.func()
      }

      if (A.decode) {
        result.content = new XmlEntities().decode(result.content)
      }

      result.image = A.image === true

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
