exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('You must enter an emoji!')
  }

  const emoji = bot.emojis.find(e => e.toString() === args[0])

  if (!emoji) {
    return msg.error('That emoji was not found!')
  }

  return msg.edit(`${emoji} \`${bot.utils.cleanCustomEmojis(emoji.toString())}\` is from ${emoji.guild.name}.`)
}

exports.info = {
  name: 'locate',
  usage: 'locate <emoji>',
  description: 'Gets the name of the guild that the emoji comes from',
  aliases: ['emoji']
}
