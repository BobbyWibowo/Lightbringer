const figlet = require('figlet')

exports.run = async (bot, msg, args) => {
  // -l -- List all fonts
  // -f <font> -- Set font
  const parsed = bot.utils.parseArgs(args, ['l', 'f:'])

  if (parsed.options.l) {
    const url = await bot.utils.gists(figlet.fontsSync().join('\n'), { suffix: 'txt' })
    return msg.edit(`A list of available fonts for \`${bot.config.prefix}${this.info.name}\` ` +
      `command can be found here:\n<${url}>`)
  }

  if (!parsed.leftover.length) {
    return msg.error('You must provide some text to render!')
  }

  const options = {}

  if (parsed.options.f) {
    options.font = parsed.options.f
  }

  figlet.text(parsed.leftover.join(' '), options, (err, res) => {
    try {
      if (err) {
        throw err
      }
      return msg.edit(bot.utils.formatCode(res))
    } catch (err) {
      msg.error(err)
    }
  })
}

exports.info = {
  name: 'figlet',
  usage: 'figlet <text>',
  description: 'Renders fancy ASCII text',
  options: [
    {
      name: '-f',
      usage: '-f <font>',
      description: 'Sets the font to use'
    },
    {
      name: '-l',
      description: 'Lists all available fonts'
    }
  ]
}
