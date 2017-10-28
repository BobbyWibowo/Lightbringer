exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['m:', 'c:', 's', 'd:'])
  const reactions = parsed.leftover.join(' ')

  if (!reactions.length) {
    throw new Error('No text provided to parse into reaction emojis!')
  }

  const channel = bot.utils.getChannel(parsed.options.c, msg.guild) || msg.channel

  if (channel.guild && !channel.permissionsFor(channel.guild.me).has('ADD_REACTIONS')) {
    throw new Error('The user have no permission to add reactions in the said channel!')
  }

  let delay = 1000 // Default delay is 1000 milliseconds (1 second)
  if (parsed.options.d) {
    delay = parseInt(parsed.options.d)
    if (isNaN(delay)) {
      throw new Error('Delay option must be a valid number!')
    }
  }

  const m = await bot.utils.getMsg(channel, parsed.options.m, msg.id)
  const emojis = bot.utils.buildEmojisArray(reactions, {
    max: 20,
    guild: channel.guild,
    unique: true,
    external: channel.guild ? channel.permissionsFor(channel.guild.me).has('USE_EXTERNAL_EMOJIS') : true
  })

  if (!emojis.length) {
    throw new Error('Unable to parse text into reaction emojis!')
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
      description: 'Specify an ID of a channel which has the message (requires -m to be set)'
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
