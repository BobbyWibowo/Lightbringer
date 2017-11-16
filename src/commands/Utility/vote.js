const R_LIST = /^l(ist)?$/i
const R_CONFIG = /^c(onfig(uration)?)?$/i

const TYPES = {
  marks: {
    regex: /^m(ark(s)?)?$/i,
    true: '✅',
    false: '❎'
  },
  arrows: {
    regex: /^a(rrow(s)?)?$/i,
    true: '⬆',
    false: '⬇'
  },
  thumbs: {
    regex: /^t(humb(s)?)?$/i,
    true: '👍',
    false: '👎'
  },
  signs: {
    regex: /^s(ign(s)?)?$/i,
    true: '➕',
    false: '➖'
  }
}
const VALID_CONFIG_KEYS = ['type', 'embed', 'color']

exports.init = async bot => {
  this.config = bot.config[this.info.name] || {}
}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['t:', 'e'])

  if (!parsed.leftover.length) {
    return msg.error(`You must provide a topic!`)
  }

  const action = parsed.leftover[0]

  if (R_LIST.test(action)) {
    return msg.edit(
      `➡\u2000|\u2000**Available types for \`${this.info.name}\` command:** ` +
      Object.keys(TYPES).map(k => `\`${k}\``).join(', ') + '.'
    )
  } else if (R_CONFIG.test(action)) {
    if (!parsed.leftover.slice(1).length) {
      return msg.edit(
        `➡\u2000|\u2000**Configuration for \`${this.info.name}\` command:**\n` +
        bot.utils.formatCode(VALID_CONFIG_KEYS.map(K => `${K}: ${String(this.config[K])}`).join('\n'), 'js')
      )
    } else {
      const split = parsed.leftover.slice(1).join(' ').split(':')
      const key = split[0].toLowerCase()

      if (!VALID_CONFIG_KEYS.includes(key)) {
        return msg.error(`This command does not support configuration with key \`${key}\`.`)
      }

      let value = split.slice(1).join(':')
      switch (key) {
        case 'type':
          const _key = get(value)
          if (!_key) {
            return msg.error('That type is not available!')
          }

          this.config[key] = _key
          value = _key
          break
        case 'embed':
          this.config[key] = !this.config[key]
          value = String(this.config[key])
          break
        default:
          if (!value) {
            delete this.config[key]
          } else {
            this.config[key] = value
          }
      }

      bot.managers.config.set(this.info.name, this.config)
      return msg.success(`Configuration saved: \`${key}: ${value || undefined}\`.`)
    }
  }

  const fallback = this.config.type || Object.keys(TYPES)[0]
  let _key = parsed.options.t ? get(parsed.options.t) : fallback
  if (!_key || !TYPES[_key]) {
    return msg.error('That type is not available!')
  }

  const topic = parsed.leftover.join(' ')
  const useEmbed = parsed.options.e ? !this.config.embed : this.config.embed
  let m

  if (useEmbed) {
    m = await msg.channel.send({
      embed: bot.utils.embed('Vote', topic, [], {
        color: this.config.color
      })
    })
    await msg.delete()
  } else {
    m = await msg.edit(`➡\u2000|\u2000${topic}`)
  }

  await m.react(TYPES[_key].true)
  return m.react(TYPES[_key].false)
}

const get = keyword => {
  for (const key of Object.keys(TYPES)) {
    if (TYPES[key].regex.test(keyword)) {
      return key
    }
  }

  return null
}

exports.info = {
  name: 'vote',
  usage: 'vote <topic|list|config [key[:value]]>',
  description: 'Make a simple vote message (automatically adds positive/negative reactions)',
  aliases: ['v'],
  options: [
    {
      name: '-t',
      usage: '-t <type>',
      description: 'Sets reaction type for this vote'
    },
    {
      name: '-e',
      usage: '-e',
      description: 'Inverse embed config for this vote'
    }
  ],
  examples: [
    'vote @user for mod!',
    'vote list',
    'vote config type:arrow',
    'vote config embed'
  ]
}
