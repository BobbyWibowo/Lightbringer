const filesize = require('filesize')

exports.run = async (bot, msg, args, auto) => {
  try {
    if (auto && auto.target.guild) {
      bot.utils.assertEmbedPermission(auto.target, auto.target.guild.me)
    } else if (msg.guild) {
      bot.utils.assertEmbedPermission(msg.channel, msg.member)
    }

    const parsed = bot.utils.parseArgs(args, ['c'])
    const channel = (msg && bot.utils.getChannel(parsed.leftover[1], msg.guild)) ||
    (auto && auto.channel) || msg.channel

    let m
    if (auto) {
      m = auto.msg
    } else {
      parsed.leftover[0] = parsed.leftover[0] !== '@' ? parsed.leftover[0] : null
      m = await bot.utils.getMsg(channel, parsed.leftover[0], msg.id)
    }

    const options = {
      thumbnail: m.author.displayAvatarURL,
      color: m.member ? m.member.displayColor : 0,
      timestamp: m.editedTimestamp || m.createdTimestamp,
      author: { name: `${m.author.tag} (ID: ${m.author.id})`, icon: m.author.displayAvatarURL },
      footer: `ID: ${m.id}${m.edits.length > 1 ? ` - Edits: #${m.edits.length - 1}` : ''}`
    }

    const nestedFields = []
    const fields = []

    if (channel.type === 'text' && channel.guild.id !== (auto ? auto.target.guild.id : msg.guild.id)) {
      fields.push({
        name: 'Guild',
        value: `${channel.guild.name} (ID: ${channel.guild.id})`
      })
    }

    if (channel.id !== (auto ? auto.target.id : msg.channel.id)) {
      fields.push({
        name: 'Channel',
        value: bot.utils.channelName(channel)
      })
    }

    if (fields.length) {
      nestedFields.push({
        title: 'Information',
        fields
      })
    }

    const attachments = m.attachments.map(a => {
      if ((a.width || a.height) && !options.image) {
        options.image = a.url
      }

      return { value: `•\u2000[${a.filename}](${a.url}) - ${filesize(a.filesize)}` }
    })

    if (attachments.length) {
      nestedFields.push({
        title: `Attachment${attachments.length !== 1 ? 's' : ''}`,
        fields: attachments
      })
    }

    if (!options.image && m.embeds.length) {
      let imageEmbed
      for (let i = 0; i < m.embeds.length; i++) {
        if (m.embeds[i].type === 'image') {
          imageEmbed = m.embeds[i]
          break
        }
      }
      if (imageEmbed) {
        options.image = imageEmbed.url || ''
      }
    }

    const embed = bot.utils.formatEmbed('', parsed.options.c ? m.cleanContent : m.toString(), nestedFields, options)
    if (auto) {
      return auto.target.send({ embed })
    } else {
      return msg.edit(msg.content, { embed })
    }
  } catch (err) {
    if (msg) {
      throw err
    } else {
      console.error(err)
    }
  }
}

exports.info = {
  name: 'quote',
  usage: 'quote [options] [id] [channel]',
  description: 'Quotes the message with the given ID (may optionally set a channel)',
  aliases: ['q'],
  options: [
    {
      name: '-c',
      usage: '-c',
      description: 'Quotes clean version of the message'
    }
  ]
}
