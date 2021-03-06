const R_LIST = /^l(ist)?$/i
const R_ADD = /^a(dd)?$|^c(reate)?$/i
const R_REMOVE = /^r(em(ove)?$)?$|^d(el(ete)?$)?$/i

exports.init = async bot => {
  this.storage = bot.storage('tags')
}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['e', 'v'])

  if (parsed.leftover.length < 1) {
    return msg.error('That action is not valid!')
  }

  const action = parsed.leftover[0]

  if (R_LIST.test(action)) {
    if (!bot.utils.hasEmbedPermission(msg.channel)) {
      return msg.error('No permission to use embed in this channel!')
    }

    const tags = this.storage.values.sort((a, b) => b.used - a.used)

    if (tags.length < 1) {
      return msg.error('You have no tags!')
    }

    await msg.edit(msg.content, {
      embed: bot.utils.formatLargeEmbed(
        `Tags [${tags.length}]`,
        '*This message will self-destruct in 60 seconds.*',
        {
          delimeter: '\n',
          children: tags.map(tag => {
            if (parsed.options.v) {
              const prefix = `**${tag.name}** – ${tag.used}x: \``
              return prefix + bot.utils.truncate(bot.utils.cleanCustomEmojis(tag.contents),
                1024 - prefix.length - 1) + '`'
            } else {
              return `•\u2000**${tag.name}** – ${tag.used}x`
            }
          })
        },
        { inline: true }
      )
    })
    return msg.delete(60000)
  } else if (R_ADD.test(action)) {
    if (parsed.leftover.length < 2) {
      return msg.error(`Usage: \`${bot.config.prefix}${this.info.name} add <name> [contents]\``)
    }

    const name = parsed.leftover[1]
    if (this.storage.get(name)) {
      return msg.error(`The tag \`${name}\` already exists!`)
    }

    let contents = parsed.leftover.slice(2).join(' ')
    if (!contents) {
      const AWAIT_TIMEOUT = 30
      await msg.edit(`Adding tag with name \`${name}\`. What content would you like to add?\n\n` +
        `Please respond with your desired content within ${AWAIT_TIMEOUT} ` +
        `second${AWAIT_TIMEOUT !== 1 ? 's' : ''} or say \`cancel\` to cancel.`)

      let m
      try {
        const collected = await msg.channel.awaitMessages(tm => tm.author === msg.author, {
          max: 1,
          time: AWAIT_TIMEOUT * 1000,
          errors: ['time']
        })
        m = collected.first()
      } catch (err) {
        return msg.error(`You did not specify your desired content within ${AWAIT_TIMEOUT} ` +
          `second${AWAIT_TIMEOUT !== 1 ? 's' : ''}.`)
      }

      contents = m.content
      await m.delete()

      if (contents === 'cancel') {
        return msg.success('The command was cancelled!')
      }
    }

    this.storage.set(name, { name, contents, used: 0 })
    this.storage.save()

    return msg.success(`The tag \`${name}\` was added!`)
  } else if (R_REMOVE.test(action)) {
    if (parsed.leftover.length < 2) {
      return msg.error(`Usage: \`${bot.config.prefix}${this.info.name} delete <name>\``)
    }

    const name = parsed.leftover[1]

    if (!this.storage.get(name)) {
      return msg.error(`The tag \`${name}\` does not exist!`)
    }

    this.storage.set(name)
    this.storage.save()

    return msg.success(`The tag \`${name}\` was deleted.`)
  } else {
    const tag = this.storage.get(action)

    if (!tag) {
      return msg.error('Action and tag with that name do not exist!')
    }

    const lo = parsed.leftover.slice(1).join(' ').replace(/\\n/g, '\n').replace(/^ +| +?$/g, '')
    const content = `${lo}${lo.slice(-1) !== '\n' && lo.length ? ' ' : ''}${tag.contents}`

    if (parsed.options.e) {
      await msg.edit(content)
    } else {
      await msg.channel.send(content)
      await msg.delete()
    }

    tag.used++

    this.storage.set(action, tag)
    this.storage.save()
  }
}

exports.info = {
  name: 'tags',
  usage: 'tags [-e] <name>|[-v] list|add <name> [contents]|delete <name>',
  description: 'Controls or lists your tags',
  aliases: ['t', 'tag'],
  options: [
    {
      name: '-e',
      usage: '-e',
      description: 'Edits message with the tag content instead of sending a new message'
    },
    {
      name: '-v',
      usage: '-v',
      description: '[<list>] Verbose (shows the tags content)'
    }
  ],
  examples: [
    'tags list',
    'tags add lol *laughs out loud*',
    'tags lol'
  ]
}
