const bot = require('./bot').client
const Discord = require('discord.js')
const encodeUrl = require('encodeurl')
const snekfetch = require('snekfetch')
const emojiRegex = require('emoji-regex')()
const pixelAverage = require('pixel-average')

exports.guildColors = bot.storage('guild-colors')

exports.randomSelection = choices => {
  return choices[Math.floor(Math.random() * choices.length)]
}

exports.randomColor = () => {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256)
  ]
}

exports.formatNumber = number => {
  if (isNaN(number)) {
    return NaN
  }

  let input = `${number}`
  if (number < 1e4) {
    return input
  }

  const out = []
  while (input.length > 3) {
    out.push(input.substr(input.length - 3, input.length))
    input = input.substr(0, input.length - 3)
  }
  return `${input},${out.reverse().join(',')}`
}

exports.truncate = (string, max, append = '') => {
  if (!string || !max || (1 + append.length) >= max) {
    return ''
  }

  if (string.length <= max && !append) {
    return string
  }

  string = string.slice(0, max - 1 - append.length)
  if (/\s/.test(string.charAt(string.length - 1))) {
    string = string.replace(/\s+?$/, '')
  }
  return string + '\u2026' + append
}

exports.assertEmbedPermission = (channel, member) => {
  if (!(channel instanceof Discord.TextChannel)) {
    throw new Error('An instance of Discord.TextChannel is required!')
  }

  if (!(member instanceof Discord.GuildMember)) {
    throw new Error('An instance of Discord.GuildMember is required!')
  }

  if (!channel.permissionsFor(member).has('EMBED_LINKS')) {
    throw new Error('No permission to use embed in this channel!')
  }
}

exports.embed = (title = '', description = '', fields = [], options = {}) => {
  const url = options.url || ''
  const color = options.color !== undefined ? options.color : this.randomColor()
  const footer = options.footer || ''
  const author = typeof options.author === 'object'
    ? options.author
    : { name: typeof options.author === 'string' ? options.author : '' }

  // NOTE: Temporary countermeasure against
  // description length issue with Discord API
  let maxLength = 2000

  fields.length = Math.min(25, fields.length)

  fields = fields.map(obj => {
    maxLength -= obj.name.length * 2

    if (options.inline) {
      obj.inline = true
    }

    if (obj.value.length > 1024) {
      obj.value = this.truncate(obj.value, 1024)
    }

    return obj
  })

  if (title.length > 256) {
    title = this.truncate(title, 256)
  }

  maxLength -= title.length + footer.length + author.length
  if (description.length > maxLength) {
    description = this.truncate(description, maxLength)
  }

  if (url !== '') {
    description = this.truncate(description, description.length, '\n')
  }

  const embed = new Discord.MessageEmbed({ fields, video: options.video || url })
    .setTitle(title)
    .setColor(color)
    .setDescription(description)
    .setImage(options.image || url)
    .setFooter(footer, options.avatarFooter ? bot.user.avatarURL : (options.footerIcon || ''))
    .setAuthor(author.name, author.icon, author.url)
    .setThumbnail(options.thumbnail || '')

  const timestamp = timestampToDate(options.timestamp)
  if (timestamp) {
    embed.setTimestamp(timestamp)
  }

  return embed
}

const timestampToDate = timestamp => {
  if (timestamp === true) {
    return new Date()
  }

  if (typeof timestamp === 'number') {
    return new Date(timestamp)
  }

  return timestamp
}

/**
 * utils.formatEmbed - This is a function to format embed
 * with a predefined structure (primarily used to format
 * fields, so it is required to specify the fields)
 *
 * @param {string} [title='']
 * @param {string} [description='']
 * @param {Object} nestedFields
 * @param {Object} [options={}]
 *
 * @returns {Discord.MessageEmbed}
 */
exports.formatEmbed = (title = '', description = '', nestedFields, options = {}) => {
  if (!nestedFields || typeof nestedFields !== 'object') {
    throw new Error('Nested fields info is not an object!')
  }

  const fields = nestedFields.map(parentField => {
    const tmp = {
      name: `${parentField.icon || '❯'}\u2000${parentField.title}`,
      value: parentField.fields.map(field => {
        let value = field.value !== undefined ? this.truncate(field.value.toString(), 1024) : ''
        let newField = `${field.name !== undefined ? `•\u2000${field.name ? `**${field.name}:** ` : ''}` : ''}${value}`

        if (options.code) {
          newField = bot.utils.formatCode(newField, options.code)
        }

        return newField.replace(/^ +| +?$/g, '') // t.trim();
      }).join('\n')
    }

    if (parentField.inline) {
      tmp.inline = parentField.inline
    }

    return tmp
  })

  if (options.simple) {
    let content = ''

    for (let i = 0; i < fields.length; i++) {
      content += `\n**${fields[i].name}:**\n${fields[i].value}`
    }

    if (options.footer) {
      content += `\n*${options.footer}*`
    }

    return content.trim()
  }

  delete options.code
  delete options.simple
  return this.embed(title, description, fields, options)
}

exports.buildSections = (children, delimeter, maxSections = 25) => {
  const sections = []
  let temp = []
  for (const child of children) {
    if (!child) {
      continue
    }

    const expectedLength = temp.join(delimeter)
      ? temp.join(delimeter).length + delimeter.length + child.length
      : child.length
    if (expectedLength > 1024) {
      sections.push(temp)
      temp = []
    }

    temp.push(child.trim())
  }
  sections.push(temp)

  sections.length = Math.min(maxSections, sections.length)
  // NOTE: Truncate sections one last time as a failsafe in case there
  // were instances of children that were longer than 1024 characters
  return sections.map(section => {
    const s = section.join(delimeter)
    return s.length > 1024 ? this.truncate(s, 1024) : s
  })
}

exports.formatLargeEmbed = (title = '', description = '', values, options = {}) => {
  if (!values || typeof values !== 'object') {
    throw new Error('Values info is not an object!')
  }

  if (!values.delimeter || !values.children) {
    throw new Error('Missing required properties from values info!')
  }

  const embed = this.embed(title, description, [], options)

  const sections = this.buildSections(values.children, values.delimeter)
  for (const section of sections) {
    embed.addField(values.sectionTitle || '---', section, true)
  }

  return embed
}

exports.parseArgs = (args, options) => {
  if (!options) {
    return args
  }

  if (typeof options === 'string') {
    options = [options]
  }

  const optionValues = {}

  let i
  for (i = 0; i < args.length; i++) {
    const arg = args[i]
    if (!arg.startsWith('-')) {
      break
    }

    const label = arg.substr(1)

    if (options.indexOf(label + ':') > -1) {
      const leftover = args.slice(i + 1).join(' ')
      const matches = leftover.match(/^"(.+?)"/)
      if (matches) {
        optionValues[label] = matches[1]
        i += matches[0].split(' ').length
      } else {
        i++
        optionValues[label] = args[i]
      }
    } else if (options.indexOf(label) > -1) {
      optionValues[label] = true
    } else {
      break
    }
  }

  return {
    options: optionValues,
    leftover: args.slice(i)
  }
}

exports.multiSend = async (channel, messages, delay) => {
  try {
    for (const m of messages) {
      await channel.send(m)
      await this.sleep(delay || 200)
    }
  } catch (err) {
    throw err
  }
}

exports.sendLarge = async (channel, largeMessage, options = {}) => {
  let message = largeMessage
  const messages = []
  const prefix = options.prefix || ''
  const suffix = options.suffix || ''

  const max = 2000 - prefix.length - suffix.length

  while (message.length >= max) {
    let part = message.substr(0, max)
    let cutTo = max
    if (options.cutOn) {
      /* Prevent infinite loop where lastIndexOf(cutOn) is the first char
       * in `part`. Later, we will correct by +1 since we did lastIndexOf on all
       * but the first char in `part`. We *dont* correct immediately, since if
       * cutOn is not found, cutTo will be -1 and we dont want that to become 0.
      */
      cutTo = part.slice(1).lastIndexOf(options.cutOn)

      // Prevent infinite loop when cutOn isnt found in message
      if (cutTo === -1) {
        cutTo = max
      } else {
        // Correction necessary from a few lines above
        cutTo += 1

        if (options.cutAfter) {
          cutTo += 1
        }

        part = part.substr(0, cutTo)
      }
    }
    messages.push(prefix + part + suffix)
    message = message.substr(cutTo)
  }

  if (message.length > 1) {
    messages.push(prefix + message + suffix)
  }

  return this.multiSend(channel, messages, options.delay)
}

exports.playAnimation = async (msg, delay, list) => {
  if (list.length < 1) {
    return
  }

  const next = list.shift()
  const start = this.now()

  try {
    await msg.edit(next)
    const elapsed = this.now() - start
    setTimeout(() => this.playAnimation(msg, delay, list), Math.max(50, delay - elapsed))
  } catch (err) {
    msg.error(err)
  }
}

exports.now = () => {
  const now = process.hrtime()
  return now[0] * 1e3 + now[1] / 1e6
}

exports.fromNow = date => {
  if (!date) {
    return false
  }

  const ms = new Date().getTime() - date.getTime()

  if (ms >= 86400000) {
    const days = Math.floor(ms / 86400000)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }

  return `${this.humanizeDuration(ms, 1, false, false)} ago`
}

exports.humanizeDuration = (ms, maxUnits, short = false, fraction = true) => {
  const round = ms > 0 ? Math.floor : Math.ceil
  const parsed = [
    {
      int: round(ms / 604800000), sin: 'week', plu: 'weeks', sho: 'w'
    },
    {
      int: round(ms / 86400000) % 7, sin: 'day', plu: 'days', sho: 'd'
    },
    {
      int: round(ms / 3600000) % 24, sin: 'hour', plu: 'hours', sho: 'h'
    },
    {
      int: round(ms / 60000) % 60, sin: 'minute', plu: 'minutes', sho: 'm'
    },
    {
      int: (round(ms / 1000) % 60) + (round(ms) % 1000 / 1000),
      sin: 'second',
      plu: 'seconds',
      sho: 's'
    }
  ]

  const result = []
  for (let i = 0; i < parsed.length; i++) {
    if (!result.length && parsed[i].int === 0) {
      continue
    }

    if (result.length >= maxUnits) {
      break
    }

    let int = parsed[i].int
    if (!result.length && fraction && i === parsed.length - 1) {
      int = int.toFixed(1)
    } else {
      int = int.toFixed(0)
    }

    result.push(`${int}${short ? parsed[i].sho : ' ' + (parseFloat(int) !== 1 ? parsed[i].plu : parsed[i].sin)}`)
  }

  return result.map((res, i) => {
    if (!short) {
      if (i === result.length - 2) {
        return res + ' and'
      } else if (i !== result.length - 1) {
        return res + ','
      }
    }
    return res
  }).join(' ')
}

exports.formatSeconds = ms => {
  const s = ms / 1000
  return `${s} second${s !== 1 ? 's' : ''}`
}

/**
 * utils.getMsg - A Promise which will return a cached message from a
 * channel. If msgId is not provided, then it will return the previous
 * message. Optionally, it can also be asked to fetch message instead.
 *
 * @param {(Discord.TextChannel|Discord.DMChannel)} channel
 * @param {number} [msgId]
 * @param {number} [curMsg]
 *
 * @returns {Discord.Message}
 */
exports.getMsg = async (channel, msgId, curMsg) => {
  if (!(channel instanceof Discord.TextChannel || channel instanceof Discord.DMChannel)) {
    throw new Error('An instance of Discord.TextChannel or Discord.DMChannel is required!')
  }

  if (msgId && isNaN(parseInt(msgId))) {
    throw new Error('Invalid message ID. It must only be numbers!')
  }

  const foundMsg = channel.messages.get(msgId || channel.messages.keyArray()[channel.messages.size - 2])

  if (!foundMsg && curMsg) {
    try {
      const msgs = await channel.fetchMessages({
        limit: 1,
        around: msgId,
        before: curMsg
      })

      if (msgs.size < 1 || (msgId ? msgs.first().id !== msgId : false)) {
        throw new Error('Message could not be fetched from the channel!')
      }

      return msgs.first()
    } catch (err) {
      throw err
    }
  } else if (foundMsg) {
    return foundMsg
  } else {
    throw new Error('Message could not be found in the channel!')
  }
}

const formatFoundList = (collection, props, name) => {
  const MAX = 20
  const isMoreThanMax = collection.size > 20
  const leftover = isMoreThanMax && collection.size - 20

  const _get = (object, props) => {
    let last = object
    for (let i = 0; i < props.length; i++) {
      last = last[props[i]] || undefined
      if (!last) break
    }
    return last
  }

  const array = collection.sort((a, b) => _get(a, props).localeCompare(_get(b, props))).array()
  array.length = Math.min(MAX, array.length)

  return new Error(`Found \`${collection.size}\` ${name}${collection.size !== 1 ? 's' : ''} with that keyword. ` +
    'Please use a more specific keywords!\n' +
    bot.utils.formatCode(`${array.map(i => _get(i, props)).join(', ')}` +
    `${isMoreThanMax ? `, and ${leftover} more\u2026` : ''}`))
}

exports.getGuildMember = (guild, keyword, fallback, indirect) => {
  if (keyword) {
    if (!(guild instanceof Discord.Guild)) {
      throw new Error('An instance of Discord.Guild is required!')
    }

    keyword = keyword.trim()

    const execMention = /^<@!?(\d+?)>$/.exec(keyword)
    if (execMention) {
      const get = guild.members.get(execMention[1])
      if (get) {
        // NOTE: 2nd element in array is an indicator that the keyword was a mention
        return [get, true]
      }
    }

    const testId = /^\d+$/.test(keyword)
    if (testId) {
      const get = guild.members.get(keyword)
      if (get) {
        return [get, false]
      }
    }

    const testTag = /#\d{4}$/.test(keyword)
    if (testTag) {
      const find = guild.members.find(m => m.user && m.user.tag === keyword)
      if (find) {
        return [find, false]
      }
    }

    const regex = new RegExp(keyword, 'i')
    const filter = guild.members.filter(m => {
      return (m.nickname && regex.test(m.nickname)) || (m.user && m.user.username && regex.test(m.user.username))
    })
    if (filter.size === 1) {
      return [filter.first(), false]
    } else if (filter.size !== 0) {
      throw formatFoundList(filter, ['user', 'tag'], 'guild member')
    }
  }

  if (fallback && !keyword) {
    return [fallback, false]
  }

  if (!indirect) {
    throw new Error('Guild member with that keyword could not be found!')
  }
}

exports.getUser = (guild, keyword, fallback) => {
  if (keyword) {
    if (guild) {
      const member = this.getGuildMember(guild, keyword, null, true)
      if (member) {
        return [member[0].user, member[1]]
      }
    }

    keyword = keyword.trim()

    const execMention = /^<@!?(\d+?)>$/.exec(keyword)
    if (execMention) {
      const get = bot.users.get(execMention[1])
      if (get) {
        // NOTE: 2nd element in array is an indicator that the keyword was a mention
        return [get, true]
      }
    }

    const testId = /^\d+$/.test(keyword)
    if (testId) {
      const get = bot.users.get(keyword)
      if (get) {
        return [get, false]
      }
    }

    const testTag = /#\d{4}$/.test(keyword)
    if (testTag) {
      const find = bot.users.find(u => u.tag === keyword)
      if (find) {
        return [find, false]
      }
    }

    const regex = new RegExp(keyword, 'i')
    const filter = bot.users.filter(u => u.username && regex.test(u.username))
    if (filter.size === 1) {
      return [filter.first(), false]
    } else if (filter.size !== 0) {
      throw formatFoundList(filter, ['tag'], 'user')
    }
  }

  if (fallback && !keyword) {
    return [fallback, false]
  }

  throw new Error('User with that keyword could not be found!')
}

exports.getGuildRole = (guild, keyword) => {
  if (!(guild instanceof Discord.Guild)) {
    throw new Error('An instance of Discord.Guild is required!')
  }

  keyword = keyword.trim()

  const execMention = /<@&?(\d+?)>/g.exec(keyword)
  if (execMention) {
    const get = guild.roles.get(execMention[1])
    if (get) {
      // NOTE: 2nd element in array is an indicator that the keyword was a mention
      return [get, true]
    }
  }

  const testId = /^\d+$/.test(keyword)
  if (testId) {
    const get = guild.roles.get(keyword)
    if (get) {
      return [get, false]
    }
  }

  const find = guild.roles.find(r => r.name === keyword)
  if (find) {
    return [find, false]
  }

  const regex = new RegExp(keyword, 'i')
  const filter = guild.roles.filter(r => regex.test(r.name))
  if (filter.size === 1) {
    return [filter.first(), false]
  } else if (filter.size !== 0) {
    throw formatFoundList(filter, ['name'], 'guild role')
  }

  throw new Error('Guild role with that keyword could not be found!')
}

exports.getGuild = keyword => {
  keyword = keyword.trim()

  const testId = /^\d+$/.test(keyword)
  if (testId) {
    const get = bot.guilds.get(keyword)
    if (get) return get
  }

  const find = bot.guilds.find(g => g.name === keyword)
  if (find) return find

  const regex = new RegExp(keyword, 'i')
  const filter = bot.guilds.filter(g => regex.test(g.name))
  if (filter.size === 1) {
    return filter.first()
  } else if (filter.size !== 0) {
    throw formatFoundList(filter, ['name'], 'guild')
  }

  throw new Error('Guild with that keyword could not be found!')
}

exports.getChannel = (keyword, guild, strict = false) => {
  if (!keyword) return false

  keyword = keyword.trim()

  const testId = /^\d+$/.test(keyword)
  if (testId) {
    const get = bot.channels.get(keyword)
    if (get) return get
  }

  if (guild) {
    const find = guild.channels.find(c => c.name === keyword)
    if (find) return find

    const regex = new RegExp(keyword, 'i')
    const filter = guild.channels.filter(c => regex.test(c.name))
    if (filter.size === 1) {
      return filter.first()
    } else if (filter.size !== 0) {
      throw formatFoundList(filter, ['name'], 'guild channel')
    }
  }

  if (!guild || !strict) {
    const channels = bot.channels.filter(c => c.type === 'dm')

    const testId = /^\d+$/.test(keyword)
    if (testId) {
      const get = channels.get(keyword)
      if (get) return get
    }

    const testTag = /#\d{4}$/.test(keyword)
    if (testTag) {
      const find = channels.get(c => c.recipient && c.recipient.tag && regex.test(c.recipient.tag))
      if (find) return find
    }

    const find = channels.find(c => c.recpient && c.recipient.username === keyword)
    if (find) return find

    const regex = new RegExp(keyword, 'i')
    const filter = channels.filter(c => c.recipient && c.recipient.username && regex.test(c.recipient.username))
    if (filter.size === 1) {
      return filter.first()
    } else if (filter.size !== 0) {
      throw formatFoundList(filter, ['recipient', 'tag'], 'DM channel')
    }
  }

  throw new Error('Channel with that keyword could not be found!')
}

exports.pad = (pad, str, padLeft) => {
  if (typeof str === 'undefined') {
    return pad
  }

  return padLeft ? (pad + str).slice(-pad.length) : (str + pad).substring(0, pad.length)
}

exports.getHostName = url => {
  const match = url.match(/:\/\/(www[0-9]?\.)?(.[^/:]+)/i)

  if (match != null && match.length > 2 && typeof match[2] === 'string' && match[2].length > 0) {
    return match[2]
  }

  return false
}

exports.fetchGuildMembers = async (guild, cache = false) => {
  if (!(guild instanceof Discord.Guild)) {
    throw new Error('An instance of Discord.Guild is required!')
  }

  if (cache) {
    return { guild, time: '' }
  }

  const beginTime = process.hrtime()
  try {
    const g = await guild.fetchMembers()
    const elapsedTime = process.hrtime(beginTime)
    const elapsedTimeNs = elapsedTime[0] * 1e9 + elapsedTime[1]
    return {
      guild: g,
      time: this.formatTimeNs(elapsedTimeNs),
      ns: elapsedTimeNs
    }
  } catch (err) {
    throw err
  }
}

const dumpName = () => {
  return `lightbringer_${new Date().getTime()}`
}

const dumpDescription = `Uploaded with Lightbringer v${process.env.npm_package_version} – ` +
  'https://github.com/BobbyWibowo/Lightbringer.\nYet another Discord self-bot written with discord.js.'

exports.haste = async (content, suffix = '', raw = false) => {
  try {
    const res = await snekfetch.post('https://hastebin.com/documents').send(content + `\n\n${dumpDescription}`)
    if (!res.body || !res.body.key) {
      throw new Error('Failed to upload, no key was returned!')
    }
    return `https://hastebin.com/${raw ? 'raw/' : ''}${res.body.key}${suffix ? `.${suffix}` : ''}`
  } catch (err) {
    throw err
  }
}

exports.paste = async (content, options = {}) => {
  const pastebinRegex = /^https?:\/\/pastebin\.com\/(\w+?)$/

  if (!config.pastebinApiDevKey) {
    throw new Error('Pastebin API dev key is missing from config.json file!')
  }

  const name = options.name || dumpName()
  const format = options.format || 'text'
  const privacy = parseInt(options.privacy) || 1
  const expiration = options.expiration || 'N'

  try {
    const res = snekfetch.post('https://pastebin.com/api/api_post.php')
      .set('Content-Type', 'application/x-www-form-urlencoded')
      .send({
        api_dev_key: config.pastebinApiDevKey,
        api_option: 'paste',
        api_paste_code: content + `\n\n${dumpDescription}`,
        api_user_key: config.pastebinApiUserKey || '',
        api_paste_name: name,
        api_paste_format: format,
        api_paste_private: privacy,
        api_paste_expire_date: expiration
      })
    if (!res.body) {
      throw new Error('Unexpected error occurred!')
    }
    const result = res.body.toString()
    if (!pastebinRegex.test(result)) {
      throw new Error(result)
    }
    return options.raw ? `https://pastebin.com/raw/${pastebinRegex.exec(result)[1]}` : result
  } catch (err) {
    throw err
  }
}

exports.gists = async (content, options = {}) => {
  const snekpost = snekfetch.post('https://api.github.com/gists')

  if (config.githubGistsToken) {
    snekpost.set('Authorization', `token ${config.githubGistsToken}`)
  }

  if (!options.suffix || options.suffix === 'md') {
    content = content.replace(/\n/g, '  \n')
  }

  try {
    const res = await snekpost.send({
      description: dumpDescription.replace(/\n/g, ' '),
      public: options.public || false,
      files: {
        [options.name || `${dumpName()}.${options.suffix || 'md'}`]: {
          content
        }
      }
    })
    if (!res.body || !res.body.html_url) {
      throw new Error('Unexpected error occurred!')
    }
    return res.body.html_url
  } catch (err) {
    throw err
  }
}

/* Powerful emojis array builder. Unfortunately,
 * regex for regular emojis is somewhat broken…
 * I'll look into a better RegEx later. */
exports.buildEmojisArray = (source, options = {}) => {
  const customEmojiRegex = /<:\w+?:(\d+?)>/
  const regionalRegex = /[a-z0-9#*!?]/
  const allEmojiRegex = new RegExp(`${emojiRegex.source}|${customEmojiRegex.source}|${regionalRegex.source}|.`, 'gi')

  const result = []
  const matches = source.match(allEmojiRegex)

  const isCustomEmojiUsable = e => !(options.unique && result.includes(e) &&
  !(!bot.user.premium && !e.managed && !(e.guild === options.guild)))

  if (matches && matches.length) {
    for (const m of matches) {
      if (options.max && result.length >= options.max) {
        break
      }

      if (m.match(new RegExp(`^${regionalRegex.source}$`, 'i'))) {
        const emojiMap = bot.consts.emojiMap[m]
        if (!emojiMap) {
          continue
        }

        const t = typeof emojiMap
        if (t === 'object') {
          for (let e of emojiMap) {
            if (e.match(/^\d*?$/)) e = bot.emojis.find('id', e)
            if (isCustomEmojiUsable(e)) {
              result.push(e)
              break
            }
          }
        } else if (t === 'string') {
          result.push(emojiMap)
        }
        continue
      }

      const customEmoji = m.match(new RegExp(`^${customEmojiRegex.source}`, 'i'))
      if (customEmoji && customEmoji[1]) {
        const e = bot.emojis.find('id', customEmoji[1])
        if (isCustomEmojiUsable(e)) {
          result.push(e)
        }
        continue
      }

      if (m.match(emojiRegex)) {
        result.push(m)
        continue
      }

      if (options.preserve) {
        result.push(m)
      }
    }
  }

  return result
}

exports.searchMessages = async (guild, options = {}) => {
  if (!guild || !(guild instanceof Discord.Guild) || !options.content || isNaN(parseInt(options.max))) {
    return []
  }

  options.excludes = options.excludes || []
  options._limit = options.max + options.excludes.length
  const pages = Math.floor((options._limit - 1) / 25)
  const messages = []

  try {
    return new Promise((resolve, reject) => {
      const s = async i => {
        options.limit = Math.min(25, options._limit)

        let array
        try {
          array = await guild.search(options)
        } catch (err) {
          return reject(err)
        }

        array.messages.forEach(cluster => {
          cluster.forEach(msg => {
            return msg.hit && !options.excludes.includes(msg.id) && messages.push(msg)
          })
        })

        if (i === pages) {
          const sorted = messages.sort((a, b) => b.createdTimestamp - a.createdTimestamp)
          sorted.length = Math.min(options.max, sorted.length)
          return resolve(sorted)
        }

        options.offset++
        options._limit -= 25
        s(i + 1)
      }
      options.offset = 0
      s(0)
    })
  } catch (err) {
    throw err
  }
}

exports.getGuildColor = async guild => {
  if (!guild.icon) {
    return [0, 0, 0]
  }

  const saved = this.guildColors.get(guild.id)
  if (saved && saved.icon === guild.icon) {
    return saved.color
  }

  try {
    return new Promise((resolve, reject) => {
      pixelAverage(guild.iconURL({ format: 'png' }), (err, avgs) => {
        if (err) {
          return reject(err)
        }

        const color = [Math.floor(avgs.red), Math.floor(avgs.green), Math.floor(avgs.blue)]
        this.guildColors.set(guild.id, { icon: guild.icon, color })
        this.guildColors.save()
        return resolve(color)
      })
    })
  } catch (err) {
    throw err
  }
}

exports.channelName = channel => {
  return channel.type === 'dm' ? `DM with ${channel.recipient.tag}` : (channel.type === 'text'
    ? `#${channel.name} (ID: ${channel.id})`
    : `${channel.type.toUpperCase()} - ${channel.name}`)
}

exports.cleanUrl = url => {
  return encodeUrl(url.replace(/ /g, '+')).replace(/\(/g, '%40').replace(/\)/g, '%41')
}

exports.formatYesNo = bool => {
  return bool ? 'yes' : 'no'
}

exports.formatCode = (text, lang = '', inline = false) => {
  return inline ? `\`${text}\`` : `\`\`\`${lang}\n${text}\n\`\`\``
}

exports.escapeMarkdown = content => {
  return content.replace(/(\\|`|\*|_|{|}|\[|]|\(|\)|\+|-|\.|!|>|~)/g, '\\$1')
}

exports.formatTimeNs = ns => {
  return ns < 1e9 ? `${(ns / 1e6).toFixed(3)} ms` : `${(ns / 1e9).toFixed(3)} s`
}

exports.cleanCustomEmojis = text => {
  return text ? text.replace(/<(:\w+?:)\d+?>/g, '$1') : ''
}

exports.capitalizeFirstLetter = input => {
  const sentences = input.split('. ')
  return sentences.map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('. ')
}

exports.sleep = duration => {
  return new Promise(resolve => setTimeout(() => resolve(), duration))
}
