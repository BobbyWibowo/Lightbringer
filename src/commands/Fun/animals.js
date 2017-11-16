const snekfetch = require('snekfetch')

const R_LIST = /^l(ist)?$/i

const ANIMALS = [
  {
    name: 'cat',
    regex: /^c(at(s)?)?$/i,
    api: 'http://thecatapi.com/api/images/get?format=xml&type=jpg,png,gif',
    action: 'regex',
    data: /<url>\s*(.+?)\s*<\/url>/i
  },
  {
    name: 'dog',
    regex: /^d(og(s)?)?$/i,
    api: 'https://random.dog/woof',
    action: 'append',
    data: 'https://random.dog/',
    exclude: /\.mp4$/i
  },
  {
    name: 'bird',
    regex: /^b(ird(s)?)?$/i,
    api: 'http://random.birb.pw/tweet/',
    action: 'append',
    data: 'http://random.birb.pw/img/'
  },
  {
    name: 'lizard',
    regex: /^li(z(ard(s)?)?)?$/i,
    api: 'https://nekos.life/api/lizard',
    action: 'json',
    data: 'url'
  }
]

const MAX_RETRY = 3

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])
  const type = parsed.leftover[0]

  if (R_LIST.test(type)) {
    return msg.edit(`🐱\u2000|\u2000**Available types for \`${this.info.name}\` command:** ${ANIMALS.map(a => `\`${a.name}\``).join(', ')}.`)
  }

  let animal
  for (const A of ANIMALS) {
    if (A.regex.test(type)) {
      animal = A
      break
    }
  }

  if (!animal) {
    animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
  }

  await msg.edit(`🔄\u2000Fetching a random ${animal.name} image\u2026`)

  let image
  let attempts = 0
  while (!image && attempts <= 3) {
    attempts++

    const res = await snekfetch.get(animal.api)
    if (res.status !== 200) {
      continue
    }

    let _image
    switch (animal.action) {
      case 'regex':
        const exec = animal.data.exec(res.body)
        if (exec && exec[1]) {
          _image = exec[1]
        }
        break
      case 'append':
        _image = animal.data + res.body
        break
      case 'json':
        _image = bot.utils.getProp(res.body, animal.data)
        break
      default:
        _image = res.body
    }

    // It will attempt to re-fetch till MAX_RETRY
    // if the image URL matched exclude regex
    if (animal.exclude && animal.exclude.test(_image)) {
      continue
    }

    image = _image
  }

  if (!image) {
    return msg.error(`Failed to fetch image after ${MAX_RETRY} retries!`)
  }

  if (parsed.options.u) {
    await msg.channel.send({ files: [ image ] })
    return msg.delete()
  } else {
    return msg.edit(image)
  }
}

exports.info = {
  name: 'animals',
  usage: 'animals [-u] [type|list]',
  description: 'Shows you random animal picture',
  aliases: ['a', 'animal'],
  options: [
    {
      name: '-u',
      usage: '-u',
      description: 'Uploads the picture as an attachment'
    }
  ],
  examples: [
    'animals',
    'animals list',
    'animals cat'
  ]
}
