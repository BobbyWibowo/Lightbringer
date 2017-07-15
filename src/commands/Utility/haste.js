exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('You must have something to upload!')
  }

  const parsed = bot.utils.parseArgs(args, ['r', 's:'])

  await msg.edit(`${PROGRESS}Uploading...`)
  const url = await bot.utils.haste(parsed.leftover.join(' '), parsed.options.s || '', parsed.options.r)
  return msg.success(`<${url}>`, { timeout: -1 })
}

exports.info = {
  name: 'haste',
  usage: 'haste [options] <text>',
  description: 'Uploads some text to Hastebin',
  aliases: ['hastebin'],
  options: [
    {
      name: '-r',
      usage: '-r',
      description: 'Returns the raw version instead'
    },
    {
      name: '-s',
      usage: '-s <suffix>',
      description: 'Suffix for the hastebin link (to set a specific syntax highlighter)'
    }
  ],
  examples: [
    'haste -s js const a = \'this is a constant variable\''
  ]
}
