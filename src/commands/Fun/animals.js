const snekfetch = require('snekfetch')

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])

  if (!parsed.leftover.length) {
    throw new Error('You must specify a type!')
  }

  const cats = (/^c(ats)?$/i.test(parsed.leftover[0]) ? true : (/^d(ogs)?$/i.test(parsed.leftover[0]) ? false : null))

  if (cats === null) {
    throw new Error('That type is not available!')
  }

  await msg.edit('🔄')
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
  aliases: ['animal'],
  options: [
    {
      name: '-u',
      usage: '-u',
      description: 'Attempts to send the image as an attachment instead'
    }
  ]
}
