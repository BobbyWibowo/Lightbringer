const translate = require('google-translate-api')
const { stripIndents } = require('common-tags')

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['e', 'f:'])

  if (msg.guild && !parsed.options.e) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  if (parsed.leftover.length < 2) {
    throw new Error('You must provide a language and some text to translate!')
  }

  const lang = parsed.leftover[0]
  const input = parsed.leftover.slice(1).join(' ')

  await msg.edit(`${PROGRESS}Translating your text...`)

  const res = await translate(input, {
    from: parsed.options.f,
    to: lang
  })

  if (parsed.options.e) {
    return msg.edit(res.text)
  } else {
    return msg.edit('Google Translate:', { embed:
      bot.utils.embed('', stripIndents`
        **From:** __\`${parsed.options.f || '[auto]'}\`__
        **To:** __\`${lang}\`__

        **Input:**\n${bot.utils.formatCode(input)}
        **Output:**\n${bot.utils.formatCode(res.text)}
      `)
    })
  }
}

exports.info = {
  name: 'translate',
  usage: 'translate <lang> <text>',
  description: 'Translates text from/to any language',
  credits: 'Carbowix',
  options: [
    {
      name: '-e',
      description: 'Edits your message with the translation instead of showing an embed'
    },
    {
      name: '-f',
      usage: '-f <language>',
      description: 'Sets the `from` language, this is `auto` by default'
    }
  ]
}
