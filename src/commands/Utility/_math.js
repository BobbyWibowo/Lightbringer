// NOTE: This command is temporarily disabled since there
// seems to be an issue with mathjs package and yarn

const mathjs = require('mathjs')
const mathjsScope = {}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['s', 'l', 'e', 'v', 'n'])

  if (parsed.options.e && msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  if (parsed.leftover.length < 1) {
    throw new Error('Please enter math expressions to evaluate!')
  }

  const expressions = parsed.leftover.join(' ').split(/\n/)
  const results = []
  for (let i = 0; i < expressions.length; i++) {
    try {
      const result = parsed.options.s
        ? mathjs.simplify(expressions[i])
        : mathjs.eval(expressions[i], parsed.options.l ? {} : mathjsScope)
      expressions[i] = (parsed.options.n ? (bot.utils.pad('  ', i + 1) + ' : ') : '') + expressions[i]
      results.push((parsed.options.n
        ? (bot.utils.pad('  ', i + 1) + ' : ') : '') + (typeof result === 'function' ? '<Function>'
        : result.toString()))
    } catch (e) {
      throw new Error(e + ` (line ${i + 1})`)
    }
  }

  const formatted = bot.utils.formatEmbed('', '',
    [
      {
        icon: '🔢',
        title: `Expression${expressions.length !== 1 ? 's' : ''}`,
        fields: [
          {
            value: expressions.join('\n')
          }
        ]
      },
      {
        icon: '🆗',
        title: parsed.options.s ? 'Simplified' : 'Result',
        fields: [
          {
            value: parsed.options.v ? results.join('\n') : results[results.length - 1]
          }
        ]
      }
    ],
    {
      footer: 'Powered by math.js library',
      footerIcon: 'https://a.safe.moe/CTmE5.png',
      color: '#dc3912',
      simple: !parsed.options.e,
      code: 'c'
    }
  )

  if (typeof formatted === 'string') {
    return msg.edit(formatted)
  } else {
    await msg.channel.send({ embed: formatted })
    return msg.delete()
  }
}

exports.info = {
  name: 'math',
  usage: 'math [options] <expressions>',
  description: 'Evaluate math expressions using mathjs library (separate individual expression by new line)',
  aliases: ['calc', 'calculate'],
  options: [
    {
      name: '-s',
      usage: '-s',
      description: 'Simplify the expressions instead'
    },
    {
      name: '-l',
      usage: '-l',
      description: 'Disable global variable scope'
    },
    {
      name: '-e',
      usage: '-e',
      description: 'Display in embed'
    },
    {
      name: '-v',
      usage: '-v',
      description: 'Verbose result'
    },
    {
      name: '-n',
      usage: '-n',
      description: 'Prepend line numbers'
    }
  ]
}
