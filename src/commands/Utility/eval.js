const { js_beautify } = require('js-beautify')
const Discord = require('discord.js') // eslint-disable-line no-unused-vars

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['nb', 'g', 'd:', 's'])

  if (parsed.leftover.length < 1) {
    return msg.error('You must provide a command to run!')
  }

  // Default depth is 0
  let depth = parsed.options.d ? parseInt(parsed.options.d) : 0
  if (isNaN(depth)) {
    return msg.error('Invalid value for depth option. It must be numbers!')
  }

  if (parsed.options.e && msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  const input = parsed.leftover.join(' ')

  const beginTime = process.hrtime()

  let result
  try {
    const evaled = await eval(input) // eslint-disable-line no-eval
    result = {
      out: evaled,
      err: false
    }
  } catch (err) {
    result = {
      out: null,
      err
    }
  }

  const elapsedTime = process.hrtime(beginTime)
  const elapsedTimeNs = elapsedTime[0] * 1e9 + elapsedTime[1]

  if (result.err) {
    console.error(`Evaluation error:\n${result.err}`)
  }

  let disout
  if (result.err) {
    disout = result.err.toString()
  } else {
    disout = require('util').inspect(result.out, { depth })
  }

  if (parsed.options.s) {
    console.warn(`[${this.info.name}] Silent mode triggered, output below\u2026`)

    // Log output without replacing anything else
    console.log(disout)
  } else {
    // Replace token
    disout = disout.replace(
      new RegExp(`${bot.token.split('').join('[^]{0,2}')}|${bot.token.split('').reverse().join('[^]{0,2}')}`, 'g'),
      '<Token>')

    // Replace path
    disout = disout.replace(new RegExp(bot.parentDir, 'g'), '<Parent>')

    // Replace quote
    disout = disout.replace(new RegExp('`', 'g'), '\u200B`')

    const disint = bot.utils.truncate(input, 1500)
    const prefix = '❯\u2000**Input:**\n' +
      bot.utils.formatCode(parsed.options.nb ? disint : js_beautify(disint), 'js') + '\n' +
      `❯\u2000**${result.err ? 'Error' : 'Output'}:**\n`
    const middle = `${bot.utils.formatCode(disout, 'js')}\n`
    const suffix = `${result.out != null ? `Type: ${result.out.constructor.name} | ` : ''}` +
      `Node.js - Execution time: ${bot.utils.formatTimeNs(elapsedTimeNs)}`

    const leftoverSpace = 2000 - prefix.length - suffix.length
    const tooLong = leftoverSpace < (Math.max(middle.length, 100))

    let gists
    if (tooLong || parsed.options.g) {
      try {
        gists = await bot.utils.gists(disout, { suffix: 'js' })
        gists = `${bot.utils.formatCode(`'${tooLong ? 'Output too long - ' : ''}GitHub Gists: ${gists}'`, 'js')}\n`
      } catch (err) {
        throw err
      }
    }

    return msg.edit(prefix + (gists || middle) + suffix)
  }
}

exports.info = {
  name: 'eval',
  usage: 'eval [options] <command>',
  description: 'Evaluates arbitrary JavaScript',
  options: [
    {
      name: '-nb',
      usage: '-nb',
      description: 'Prevents the bot from beautifying input'
    },
    {
      name: '-g',
      usage: '-g',
      description: 'Forcibly uploads the output to GitHub Gists (by default it will only upload when the output is too long)'
    },
    {
      name: '-d',
      usage: '-d <depth>',
      description: 'Forcibly sets depth parameter for util.inspect() (by default the depth is 0 and recommended maximum is 2)'
    },
    {
      name: '-s',
      usage: '-s',
      description: 'Silent mode'
    }
  ]
}
