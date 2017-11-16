exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!args.length) {
    return msg.error('You must specify something to embed!')
  }

  const parsed = bot.utils.parseArgs(args, ['ft:', 't:', 'c:', 'r', 'i:', 'a:', 'th:'])

  let color = parsed.options.c
  if (parsed.options.r && msg.guild && msg.guild.members) {
    const member = msg.guild.members.get(msg.author.id)
    if (member) {
      color = member.highestRole.hexColor
    }
  }

  if (color) {
    if (!color.startsWith('#')) {
      color = `#${color}`
    }

    if (!/^#[a-fA-F0-9]{6}$/.test(color)) {
      return msg.error(`Invalid color: \`${color}\`. Please use valid hex format (\`#RRGGBB\`)`)
    }
  }

  await msg.channel.send({
    embed: bot.utils.embed(parsed.options.t || '', parsed.leftover.join(' '), [], {
      footer: parsed.options.ft,
      color,
      image: parsed.options.i,
      author: parsed.options.a,
      thumbnail: parsed.options.tb
    })
  })
  return msg.delete()
}

exports.info = {
  name: 'embed',
  usage: 'embed [options] <text>',
  description: 'Sends a message via embeds',
  options: [
    {
      name: '-ft',
      usage: '-ft <text>',
      description: 'Sets the footer text (use quotes for multiple words)'
    },
    {
      name: '-t',
      usage: '-t <text>',
      description: 'Sets the embed title (use quotes for multiple words)'
    },
    {
      name: '-r',
      description: 'Uses your role color for the embed color'
    },
    {
      name: '-c',
      usage: '-c <color>',
      description: 'Sets a hex color for the embed in the format of `#RRGGBB`'
    },
    {
      name: '-i',
      usage: '-i <url>',
      description: 'Sets an image for the embed'
    },
    {
      name: '-a',
      usage: '-a <name>',
      description: 'Sets the author of the embed'
    },
    {
      name: '-th',
      usage: '-th <url>',
      description: 'Sets a thumbnail for the embed'
    }
  ]
}
