exports.init = async bot => {
  this._stats = bot.managers.stats
}

exports.run = async (bot, msg, args) => {
  const action = /^u(tils)?$/i.test(args[0]) ? 'utils' : (/^c(onst(s)?)?$/i.test(args[0]) ? 'consts' : null)

  if (args.length > 0 && !action) {
    throw new Error('That action is not valid!')
  }

  this._stats.set('RELOADING', true)
  await msg.edit(`${PROGRESS}Reloading\u2026`)

  try {
    if (action) {
      // NOTE: Basic check to use \\ instead of / for Windows machine
      const filePath = `${bot.srcDir}${bot.srcDir.includes('\\') ? '\\' : '/'}${action}.js`

      try {
        delete require.cache[filePath]
        bot[action] = require(filePath)
        msg.success(`\`${action}.js\` was successfully reloaded!`)
      } catch (e) {
        throw e
      }
    } else {
      const beginTime = process.hrtime()
      const reload = await bot.commands.loadCommands(bot.commandsDir, '-a')
      const elapsedTime = process.hrtime(beginTime)
      const elapsedTimeNs = elapsedTime[0] * 1e9 + elapsedTime[1]

      if (!reload) {
        throw new Error('An unexpected error occurred while trying to reload the ' +
          `${action === 'p' ? 'plugin' : 'module'}s!`)
      }

      msg.success(
        `\`${reload.y}\` ${action === 'p' ? 'plugin' : 'module'}` +
        `${reload.y !== 1 ? 's were' : ' was'} successfully loaded! (${bot.utils.formatTimeNs(elapsedTimeNs)}) - ` +
        `Previously there were \`${reload.x}\` ${action === 'p' ? 'plugin' : 'module'}${reload.y !== 1 ? 's' : ''}.`
      )
    }
  } catch (err) {
    this._stats.set('RELOADING')
    throw err
  }

  this._stats.set('RELOADING')
  return true
}

exports.info = {
  name: 'reload',
  usage: 'reload [utils|consts]',
  description: 'Reloads all modules (or optionally reload `utils` or `consts`)',
  aliases: ['r']
}
