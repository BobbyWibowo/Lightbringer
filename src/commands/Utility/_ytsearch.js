// This command is temporarily disabled
// until youtube-scrape package is fixed

const yts = require('youtube-scrape')

exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!args.length) {
    return msg.error('You must specify something to search!')
  }

  await msg.edit('🔄')
  const data = await yts(`${args.join(' ')}`)

  if (data && data.results && data.results[0]) {
    const result = data.results[0]
    await msg.channel.send({
      embed: bot.utils.embed('', `[${result.title}](${result.link})`, [
        {
          name: '👀\u2000Views',
          value: bot.utils.formatNumber(result.views)
        },
        {
          name: '⌛\u2000Length',
          value: result.length
        }
      ], { image: result.thumbnail })
    })
    return msg.delete()
  } else {
    return msg.error('No matches found!')
  }
}

exports.info = {
  name: 'yt',
  usage: 'yt <query>',
  description: 'Fetches info about a YouTube video'
}
