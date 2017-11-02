const { exec } = require('child_process')
const username = require('os').userInfo().username

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['l:', 's'])

  if (!parsed.leftover.length) {
    return msg.error('You must provide a command to run!')
  }

  const ps = exec(parsed.leftover.join(' '))
  if (!ps) {
    return msg.error('Failed to start process!')
  }

  if (!parsed.options.s) {
    const send = data => {
      bot.utils.sendLarge(msg.channel, clean(data, bot.parentDir), {
        prefix: `\`\`\`${parsed.options.l || 'bash'}\n`,
        suffix: '\n```',
        cutOn: '\n'
      })
    }

    ps.stdout.on('data', send)
    ps.stderr.on('data', send)
  }
}

const clean = (data, parent) => {
  return data.toString()
    .replace(new RegExp(parent, 'g'), '<Parent>')
    .replace(new RegExp(username, 'g'), '<Username>')
    .replace(/\[[0-9]*m/g, '')
}

exports.info = {
  name: 'exec',
  usage: 'exec [options] <command>',
  description: 'Executes a command in the console',
  options: [
    {
      name: '-l',
      usage: '-l <lang>',
      description: 'Sets language for syntax highlighting (code display)'
    },
    {
      name: '-s',
      usage: '-s',
      description: 'Silent mode'
    }
  ]
}
