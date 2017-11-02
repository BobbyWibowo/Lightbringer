const normalizeUrl = require('normalize-url')

exports.run = async (bot, msg, args) => {
  if (bot.commands.get('lastfm') && bot.commands.get('lastfm').nowPlaying) {
    return msg.error('Last.fm listener is currently handling your game message automatically.')
  }

  if (!args.length) {
    await bot.user.setGame()
    return msg.success('Cleared your game!')
  }

  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const parsed = bot.utils.parseArgs(args, ['s:'])

  const game = parsed.leftover.join(' ')
  const stream = parsed.options.s ? normalizeUrl(parsed.options.s) : ''

  await bot.user.setGame(game || stream, stream)
  return msg.success(`Game changed! - Game: ${game} ${stream ? `(Stream URL: ${stream})` : ''}`)
}

exports.info = {
  name: 'setgame',
  usage: 'setgame <game>',
  description: 'Sets your game (shows for other people)',
  aliases: ['setactivity'],
  options: [
    {
      name: '-s',
      usage: '-s <url>',
      description: 'Sets your streaming URL to http://twitch.tv/<url>'
    }
  ]
}
