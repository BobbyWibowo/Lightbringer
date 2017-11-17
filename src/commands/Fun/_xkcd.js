/*
 * No interest in maintaining this.
 */

const xkcd = require('xkcd-imgs')

exports.run = async (bot, msg) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  await msg.edit('🔄')
  xkcd.img(async (err, res) => {
    try {
      if (err) {
        throw err
      }
      return msg.edit('Random xckd comics:', {
        embed: bot.utils.embed('', res.title, [], { url: res.url })
      })
    } catch (err) {
      msg.error(err)
    }
  })
}

exports.info = {
  name: 'xkcd',
  usage: 'xkcd',
  description: 'Shows you random xkcd comics'
}
