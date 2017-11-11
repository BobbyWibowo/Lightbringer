exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['m:', 'c:', 's', 'd:'])
  const reactions = parsed.leftover.join(' ')

  if (!reactions.length) {
    return msg.error('No text provided to parse into reaction emojis!')
  }

  const channel = bot.utils.getChannel(parsed.options.c, msg.guild) || msg.channel

  if (channel.guild && !channel.permissionsFor(channel.guild.me).has('ADD_REACTIONS')) {
    return msg.error('The user have no permission to add reactions in the said channel!')
  }

  // Default delay is 1000 milliseconds (1 second)
  const delay = parsed.options.d ? parseInt(parsed.options.d) : 1000
  if (isNaN(delay)) {
    return msg.error('Invalid value for delay option. It must be numbers!')
  }

  const m = await bot.utils.getMsg(channel, parsed.options.m, msg.id)
  const emojis = bot.utils.buildEmojisArray(reactions, {
    max: 20,
    guild: channel.guild,
    unique: true,
    external: channel.guild ? channel.permissionsFor(channel.guild.me).has('USE_EXTERNAL_EMOJIS') : true
  })

  if (!emojis.length) {
    return msg.error('Unable to parse text into reaction emojis!')
  }

  if (parsed.options.s) {
    await msg.delete()
  } else {
    await msg.edit(`${PROGRESS}Reacting (${delay}ms delay)...`)
  }

  try {
    for (let i = 0; i < emojis.length; i++) {
      await m.react(emojis[i])
      if (i < emojis.length - 1) {
        await bot.utils.sleep(delay)
      } else {
        await bot.utils.sleep(1000) // Wait 1 second before updating status message (mere cosmetic purpose)
      }
    }
  } catch (err) {
    if (parsed.options.s) {
      console.error(err)
    } else {
      throw err
    }
  }

  if (!parsed.options.s) {
    await msg.success('Done!')
  }
}

exports.info = {
  name: 'reaction',
  usage: 'reaction [options] <text|emoji|both>',
  description: 'Sends reaction to the previous message',
  aliases: ['react'],
  options: [
    {
      name: '-m',
      usage: '-m <id>',
      description: 'Specify an ID of a message to react to'
    },
    {
      name: '-c',
      usage: '-c <id>',
      description: 'Specify an ID of a channel which has the message (without -m, it will apply reactions to the very last message in the channel)'
    },
    {
      name: '-s',
      usage: '-s',
      description: 'Silent mode'
    },
    {
      name: '-d',
      usage: '-d <delay>',
      description: 'Sets delay between every reaction (default is 1000 milliseconds)'
    }
  ],
  examples: [
    'react hi girl',
    'react -s hi girl',
    'react -d 250 hi girl'
  ]
}
