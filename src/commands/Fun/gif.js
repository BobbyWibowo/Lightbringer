const giphy = require('giphy-api')()

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['u'])

  if (parsed.leftover.length < 1) {
    return msg.error('You must provide something to search for!')
  }

  await msg.edit('🔄')
  giphy.random(`${parsed.leftover.join(' ')}`, async (err, res) => {
    try {
      if (err) {
        throw err
      }

      if (!res.data.url) {
        return msg.error('No matches found!')
      }

      const key = res.data.url.substr(res.data.url.lastIndexOf('-') + 1)
      const url = `https://media.giphy.com/media/${key}/giphy.gif`

      if (parsed.options.u) {
        await msg.channel.send({ files: [ url ] })
        return msg.delete()
      } else {
        return msg.edit(url)
      }
    } catch (err) {
      msg.error(err)
    }
  })
}

exports.info = {
  name: 'gif',
  usage: 'gif [-u] <query>',
  description: 'Searches Giphy for GIFs',
  aliases: ['giphy'],
  options: [
    {
      name: '-u',
      usage: '-u',
      description: 'Attempts to send the image as an attachment instead'
    }
  ]
}
