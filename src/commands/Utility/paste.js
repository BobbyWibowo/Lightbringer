exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('You must have something to upload!')
  }

  const parsed = bot.utils.parseArgs(args, ['r', 'n:', 'f:', 'e:', 'p:'])

  await msg.edit(`${PROGRESS}Uploading...`)
  const url = await bot.utils.paste(parsed.leftover.join(' '), {
    raw: parsed.options.r,
    name: parsed.options.n,
    format: parsed.options.f,
    privacy: parsed.options.p,
    expiration: parsed.options.e
  })
  return msg.success(`<${url}>`, { timeout: -1 })
}

exports.info = {
  name: 'paste',
  usage: 'paste [options] <text>',
  description: 'Uploads some text to Pastebin',
  aliases: ['pastebin'],
  options: [
    {
      name: '-r',
      usage: '-r',
      description: 'Returns the raw version instead'
    },
    {
      name: '-n',
      usage: '-n <name>',
      description: 'Sets paste name'
    },
    {
      name: '-f',
      usage: '-f <format>',
      description: 'File format (sets syntax highlighting too) - [Full list](https://pastebin.com/api#5)'
    },
    {
      name: '-p',
      usage: '-p <0|1|2>',
      description: 'Sets privacy (0 = public, 1 = unlisted, 2 = private)'
    },
    {
      name: '-e',
      usage: '-e <N|10M|1H|1D|1W|2W|1M>',
      description: 'Sets expiry date'
    }
  ],
  examples: [
    'paste -f javascript const a = \'this is a constant variable\''
  ]
}
