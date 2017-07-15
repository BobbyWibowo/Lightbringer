const snekfetch = require('snekfetch')
const txtgen = require('txtgen')
const dotProp = require('dot-prop')
const { XmlEntities } = require('html-entities')

const apis = [
  {
    name: 'joke',
    regex: '^j(oke)?$',
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
    parseJson: true,
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
    throw new Error(`You must specify a type! Available types: ${apis.map(a => `\`${a.name}\``).join(', ')}.`)
  }

  let result = {
    content: '',
    image: false
  }

  await msg.edit('🔄')
  for (const a of apis) {
    if (new RegExp(a.regex, 'i').test(args[0])) {
      if (a.api) {
        const res = await snekfetch.get(a.api)
        if (!res || !res.body) {
          throw new Error('Could not fetch data')
        }
        const body = a.parseJson ? JSON.parse(res.body) : res.body
        if (a.prop) {
          if (dotProp.has(body, a.prop)) {
            result.content = dotProp.get(body, a.prop)
          } else {
            throw new Error('Could not fetch data')
          }
        } else {
          result.content = body
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
    throw new Error('That type is not available!')
  }

  await msg.channel.send(result.image
    ? { file: { attachment: result.content } }
    : bot.utils.truncate(result.content, 2000))
  return msg.delete()
}

exports.info = {
  name: 'get',
  usage: 'get [type]',
  description: 'Gets random thing from various APIs',
  aliases: ['g', 'f', 'fetch']
}
