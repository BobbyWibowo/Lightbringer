const chalk = require('chalk')
const { inspect } = require('util')

/**
 * The Lightbringer logger
 *
 * @class Logger
 */
class Logger {
  /**
   * Creates an instance of Logger.
   * @param {Lightbringer} bot
   *
   * @memberOf Logger
   */
  constructor (bot) {
    this.bot = bot
  }

  _log (prefix, message) {
    (console._original.log || console.log)(`${prefix} ${message}`)
  }

  info (message) {
    this._log && this._log(chalk.green('\u2713'), message)
  }

  warn (message, error) {
    this._log && this._log(chalk.yellow('!'), message)
    error && console.error(error)
  }

  severe (message, error) {
    this._log && this._log(chalk.red('!'), message)
    error && console.error(error)
  }

  debug (message) {
    this.info(inspect(message))
  }

  inject () {
    if (console._original) throw new Error('Logger already injected!')

    const original = {
      log: console.log,
      info: console.info,
      error: console.error,
      debug: console.debug
    }

    console._original = original

    console.log = this._wrap(this.info)
    console.info = this._wrap(this.warn)
    console.error = this._wrap(this.severe)
    console.debug = this._wrap(this.debug)
  }

  _wrap (func) {
    const self = this
    return function () {
      func.call(self, Array.from(arguments))
    }
  }
}

module.exports = Logger
