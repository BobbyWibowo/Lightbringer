/*
 * No interest in maintaining this command.
 */

const translate = require('google-translate-api')
const { stripIndents } = require('common-tags')

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['e', 'f:'])

  if (!parsed.options.e && !bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (parsed.leftover.length < 2) {
    return msg.error('You must provide a language and some text to translate!')
  }

  const lang = parsed.leftover[0]
  const input = parsed.leftover.slice(1).join(' ')

  await msg.edit(`${consts.p}Translating your text...`)

  const res = await translate(input, {
    from: parsed.options.f,
    to: lang
  })

  if (parsed.options.e) {
    return msg.edit(res.text)
  } else {
    return msg.edit('Google Translate:', {
      embed: bot.utils.embed('', stripIndents`
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
      description: 'Edits your message with the translation instead of sending an embed'
    },
    {
      name: '-f',
      usage: '-f <language>',
      description: 'Sets the `from` language, this is `auto` by default'
    }
  ]
}
