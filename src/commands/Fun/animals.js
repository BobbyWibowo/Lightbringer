const snekfetch = require('snekfetch')

const animals = [
  {
    name: 'cat',
    regex: /^c(at(s)?)?$/i,
    api: 'http://thecatapi.com/api/images/get?format=xml&type=jpg,png,gif',
    action: {
      type: 'regex',
      data: /<url>\s*(.+?)\s*<\/url>/i
    }
  },
  {
    name: 'dog',
    regex: /^d(og(s)?)?$/i,
    api: 'https://random.dog/woof',
    action: {
      type: 'append',
      data: 'https://random.dog/'
    }
  },
  {
    name: 'bird',
    regex: /^b(ird(s)?)?$/i,
    api: 'http://random.birb.pw/tweet/',
    action: {
      type: 'append',
      data: 'http://random.birb.pw/img/'
    }
  },
  {
    name: 'lizard',
    regex: /^li(z(ard(s)?)?)?$/i,
    api: 'https://nekos.life/api/lizard',
    action: {
      type: 'json',
      data: 'url'
    }
  }
]

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])
  const type = parsed.leftover[0]

  if (/^l(ist)?$/i.test(type)) {
    return msg.edit(`🐱\u2000|\u2000**Available types for \`${this.info.name}\` command:** ${animals.map(a => `\`${a.name}\``).join(', ')}.`)
  }

  let animal
  for (let i = 0; i < animals.length; i++) {
    if (animals[i].regex.test(type)) {
      animal = animals[i]
      break
    }
  }

  if (!animal) {
    animal = animals[Math.floor(Math.random() * animals.length)]
  }

  await msg.edit(`🔄\u2000Fetching a random ${animal.name} image\u2026`)
  const res = await snekfetch.get(animal.api)

  if (res.status !== 200) {
    return msg.error('Failed to fetch image!')
  }

  let image
  switch (animal.action.type) {
    case 'regex':
      const exec = animal.action.data.exec(res.body)
      if (exec && exec[1]) {
        image = exec[1]
      }
      break
    case 'append':
      image = animal.action.data + res.body
      break
    case 'json':
      image = bot.utils.getProp(res.body, animal.action.data)
      break
    default:
      image = res.body
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
