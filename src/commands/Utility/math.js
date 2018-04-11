const mathjs = require('mathjs')
const mathjsScope = {}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['s', 'l', 'v'])

  if (parsed.leftover.length < 1) {
    return msg.error('Please enter math expressions to evaluate!')
  }

  const beginTime = process.hrtime()

  const expressions = parsed.leftover.join(' ').split(/\n/)
  const pads = ' '.repeat(expressions.length.toString().length)
  const results = []
  for (const e of expressions) {
    try {
      const result = parsed.options.s ? mathjs.simplify(e) : mathjs.eval(e, parsed.options.l ? {} : mathjsScope)
      results.push(typeof result === 'function' ? 'Function' : result.toString())
    } catch (err) {
      results.push(err)
      break
    }
  }

  const elapsedTime = process.hrtime(beginTime)
  const elapsedTimeNs = elapsedTime[0] * 1e9 + elapsedTime[1]

  msg.edit(`❯\u2000**Expression${expressions.length !== 1 ? 's' : ''}:**\n` +
    `${bot.utils.formatCode(expressions.map((e, i) => (parsed.options.v
      ? (bot.utils.pad(pads, i + 1) + ' : ')
      : '') + e).join('\n'), 'js')}\n` +
    `❯\u2000**${parsed.options.s ? 'Simplified' : 'Result'}:**\n` +
    `${bot.utils.formatCode(parsed.options.v
      ? results.map((r, i) => bot.utils.pad(pads, i + 1) + ' : ' + r).join('\n')
      : results[results.length - 1], 'js')}\n` +
    `Math.js - Execution time: ${bot.utils.formatTimeNs(elapsedTimeNs)}`)
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
      name: '-v',
      usage: '-v',
      description: 'Verbose (shows step-by-step results and append line numbers)'
    }
  ]
}
