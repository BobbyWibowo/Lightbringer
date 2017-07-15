exports.run = async (bot, msg, args) => {
  const channel = bot.utils.getChannel(args[1], msg.guild) || msg.channel

  const m = await bot.utils.getMsg(channel, args[0], msg.id)
  const msgOps = {}

  if (m.attachments.size) {
    msgOps.files = [
      {
        attachment: m.attachments.first().url,
        name: m.attachments.first().filename
      }
    ]
  }

  if (m.embeds.length) {
    let richEmbed
    for (let i = 0; i < m.embeds.length; i++) {
      if (m.embeds[i].type === 'rich') {
        richEmbed = m.embeds[i]
        break
      }
    }

    if (richEmbed) {
      if (msg.guild) {
        bot.utils.assertEmbedPermission(msg.channel, msg.member)
      }

      msgOps.embed = bot.utils.embed(richEmbed.title, richEmbed.description, [], {
        color: richEmbed.hexColor,
        footer: richEmbed.footer && richEmbed.footer.text,
        footerIcon: richEmbed.footer && richEmbed.footer.iconURL,
        thumbnail: richEmbed.thumbnail && richEmbed.thumbnail.url,
        timestamp: richEmbed.createdTimestamp,
        image: richEmbed.image && richEmbed.image.url,
        author: richEmbed.author ? {
          name: richEmbed.author.name,
          icon: richEmbed.author.iconURL,
          url: richEmbed.author.url
        } : { name: '' }
      })

      for (let i = 0; i < richEmbed.fields.length; i++) {
        msgOps.embed.addField(richEmbed.fields[i].name, richEmbed.fields[i].value, richEmbed.fields[i].inline)
      }
    }
  }

  if (m.edits.length > 1 && !msgOps.files) {
    // NOTE: Faking "edited" status whenever possible
    return msg.edit(m.content, msgOps)
  } else {
    await msg.channel.send(m.content, msgOps)
    return msg.delete()
  }
}

exports.info = {
  name: 'clone',
  usage: 'clone [id] [channel]',
  description: 'Clones the message with the given ID (may optionally set a channel)',
  aliases: ['copy']
}
