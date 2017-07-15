const ascii = `
  _______   _________    _________   ,        ,
 /              |       /            |        |
|               |      |             |        |
|               |      |             |        |
 \\_____,        |      |  _______,   |________|
        \\       |      |         |   |        |
         |      |      |         |   |        |
         |      |      |         |   |        |
  ______/   ____|____   \\________|   |        |
\u200b
`

exports.run = async (bot, msg) => {
  return msg.edit(bot.utils.formatCode(ascii))
}

exports.info = {
  name: 'sigh',
  usage: 'sigh',
  description: 'Dramatic sigh text'
}
