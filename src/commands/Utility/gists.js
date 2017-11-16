exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.error('You must have something to upload!')
  }

  const parsed = bot.utils.parseArgs(args, ['n:', 's:', 'p'])

  await msg.edit(`${consts.p}Uploading...`)
  const url = await bot.utils.gists(parsed.leftover.join(' '), {
    name: parsed.options.n,
    suffix: parsed.options.s,
    public: parsed.options.p
  })
  return msg.success(`<${url}>`, { timeout: -1 })
}

exports.info = {
  name: 'gists',
  usage: 'gists [options] <text>',
  description: 'Uploads some text to GitHub Gists',
  aliases: ['gist'],
  options: [
    {
      name: '-n',
      usage: '-n <name>',
      description: 'Sets file name'
    },
    {
      name: '-s',
      usage: '-s <suffix>',
      description: 'File name suffix'
    },
    {
      name: '-p',
      usage: '-p',
      description: 'Makes the gist public'
    }
  ],
  examples: [
    'gists -s js const a = \'this is a constant variable\''
  ]
}
