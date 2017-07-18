const snekfetch = require('snekfetch')

const CATS = /^c(at(s)?)?$/i
const DOGS = /^d(og(s)?)?$/i

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])

  if (!parsed.leftover.length) {
    throw new Error('You must specify a type! Available types: `cats`, `dogs`.')
  }

  const type = parsed.leftover[0]
  const cats = (CATS.test(type) ? true : (DOGS.test(type) ? false : null))

  if (cats === null) {
    throw new Error('That type is not available!')
  }

  await msg.edit(`🔄\u2000Fetching a random ${cats ? 'cat' : 'dog'} image\u2026`)
  const res = await snekfetch.get(cats ? 'http://www.random.cat/meow' : 'http://random.dog/woof')
  const image = cats ? res.body.file : `http://random.dog/${res.body}`

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
