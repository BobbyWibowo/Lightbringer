const Roll = require('roll')
const { stripIndents } = require('common-tags')

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('You must specify in dice notation (XdY)')
  }

  const notation = args[0]
  const roll = new Roll()
  if (!roll.validate(notation)) {
    return msg.error(`\`${notation}\` is not a valid dice notation!`)
  }

  const reason = args.splice(1).join(' ')
  const rolled = roll.roll(notation)

  // NOTE: Sending a new message instead of a new one
  // to ensure the message doesn't appear to be "edited"
  await msg.channel.send(stripIndents`
    🎲\u2000**${args[0]}**\u2000|\u2000Here are the rolls:
    ${bot.utils.formatCode(rolled.calculations[1].join(', '), 'js')}
    In the end, the result was: **${rolled.result}**${reason ? `\u2000|\u2000*${reason}*` : ''}`)
  return msg.delete()
}

exports.info = {
  name: 'roll',
  usage: 'roll XdY [reason]',
  description: 'Rolls X dice with Y sides (supports standard dice notation)',
  aliases: ['dice', 'diceroll', 'rolldice']
}
