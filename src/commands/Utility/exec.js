const { exec } = require('child_process')
const username = require('os').userInfo().username

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    throw new Error('You must provide a command to run!')
  }

  const parsed = bot.utils.parseArgs(args, 'l:')

  const ps = exec(parsed.leftover.join(' '))
  if (!ps) {
    throw new Error('Failed to start process!')
  }

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

const clean = (data, parent) => {
  return data.toString()
    .replace(new RegExp(parent, 'g'), '<Parent>')
    .replace(new RegExp(username, 'g'), '<Username>')
    .replace(/\[[0-9]*m/g, '')
}

exports.info = {
  name: 'exec',
  usage: 'exec [-l <lang>] <command>',
  description: 'Executes a command in the console'
}
