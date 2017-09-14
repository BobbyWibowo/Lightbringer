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
  }
]

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])

  if (!parsed.leftover.length) {
    throw new Error('You must specify a type! Available types: `cats`, `dogs`.')
  }

  const type = parsed.leftover[0]

  let image
  for (const animal of animals) {
    if (animal.regex.test(type)) {
      await msg.edit(`🔄\u2000Fetching a random ${animal.name} image\u2026`)
      const res = await snekfetch.get(animal.api)
      if (animal.action && animal.action.type === 'regex') {
        const exec = animal.action.data.exec(res.body)
        if (exec && exec[1]) {
          image = exec[1]
        }
      } else if (animal.action && animal.action.type === 'append') {
        image = animal.action.data + res.body
      } else {
        image = res.body
      }
      break
    }
  }

  if (!image) {
    throw new Error('Failed to fetch image or that type is possibly not available!')
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
  usage: 'animals [-u] <cats|dogs>',
  description: 'Shows you random pictures of cats or dogs',
  aliases: ['a', 'animal'],
  options: [
    {
      name: '-u',
      usage: '-u',
      description: 'Attempts to send the image as an attachment instead'
    }
  ]
}
