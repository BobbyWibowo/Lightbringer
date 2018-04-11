/*
 * This command is temporarily disabled since a single embed can not list
 * all available Classes and Typedefs in discord.js.
 * I'm working on an util function to automatically split message into
 * multiple embeds. Until then, this command will remain disabled.
 */

const snekfetch = require('snekfetch')
const { stripIndents } = require('common-tags')

let docs = { _version: 'stable' }

const TITLE = 'Discord.js docs'

exports.init = async bot => {
  try {
    await fetchDocs(docs._version)
  } catch (err) {
    console.error(err)
  }
}

exports.run = async (bot, msg, args) => {
  if (!docs) {
    await msg.edit(`${consts.p}API docs might have failed to load. Reloading...`)
    await fetchDocs()
    return msg.success('API docs successfully reloaded. You may now try again!')
  }

  let embed
  if (!args.length) {
    embed = buildEmbed(docs, null, 2)
  } else {
    const keywords = args[0].split('.')
    if (keywords[0] === 'version') {
      if (!args[1]) {
        return msg.error('You must specify a valid version string!')
      }
      await fetchDocs(args[1])
      return msg.success(`Successfully loaded docs with version: \`${args[1]}\`!`)
    } else {
      const find = ['classes', 'typedefs']
      for (let i = 0; i < find.length; i++) {
        const found = docs[find[i]].find(v => v.name && v.name.toLowerCase() === keywords[0].toLowerCase())
        if (found) {
          embed = buildEmbed(found, keywords[1], i)
          break
        }
      }
    }
  }

  if (!embed) {
    return msg.error('Could not get any information with that keyword from API docs!')
  }

  return msg.edit(msg.content, { embed })
}

const buildEmbed = (data, sub, type) => {
  const DOCS_ROOT = `https://discord.js.org/#/docs/main/${docs._version}`

  const formatTypeInline = (types, nullable = false) => {
    return (nullable ? '?' : '') + (types[0] === '*' ? '`...*`' : types.map(type => {
      return `\`${type.map(sub => typeof sub !== 'string' ? sub.join('') : sub).join('')}\``
    }).join(' or '))
  }

  const formatLink = (main, sub, mask) => {
    return `${mask ? `[${mask}](` : ''}${DOCS_ROOT}/class/${main}${sub ? `?scrollTo=${sub}` : ''}${mask ? ')' : ''}`
  }

  const formatDescription = description => {
    return description
      .replace(/(\n\* |\n- |\n)/g, id => {
        return id !== '\n' ? '\n•\u2000' : ' '
      })
      .replace(/{@link (.+?)}/g, (...args) => {
        const parsed = args[1].split('#')
        return formatLink(parsed[0], parsed[1], args[1])
      })
      .replace(/<(info|warn)>(.+?)<\/(info|warn)>/g, (...args) => {
        return `\n\n**${args[1].toUpperCase()}:** ${args[2]}`
      })
  }

  const formatSections = (title, props, delimeter) => {
    const sections = bot.utils.buildSections(props, delimeter)
    const fields = []
    for (let i = 0; i < sections.length; i++) {
      fields.push({
        name: i > 0 ? '---' : `❯\u2000${title}`,
        value: sections[i].replace(/@/g, '@')
      })
    }
    return fields
  }

  const formatPropFields = (data, title) => {
    const delimeter = '\n**---**\n'
    const props = data.map(p => {
      return stripIndents`
        **Param:** \`${p.name}\`
        **Types:** ${formatTypeInline(p.type)}
        **Optional:** ${bot.utils.formatYesNo(p.optional)}
        **Default:** ${p.hasOwnProperty('default') ? `\`${p.default.toString()}\`` : '*none*'}
        **Desc:** ${formatDescription(p.description)}`
    })
    return formatSections(title, props, delimeter)
  }

  const DESC = '**---**'
  const parsed = {
    name: data.name || '',
    description: DESC,
    fields: [],
    options: {
      color: '#2196f3',
      author: {
        name: `${TITLE}: ${docs._version}`,
        icon: 'https://the.fiery.me/TJDR.png',
        url: `${DOCS_ROOT}/general/welcome`
      }
    },
    meta: data.meta,
    subname: ''
  }

  switch (type) {
    case 0: {
      const find = [
        { prop: 'props', title: 'Properties' },
        { prop: 'methods', title: 'Methods' },
        { prop: 'events', title: 'Events' }
      ]

      if (sub) {
        let found
        for (const key of find) {
          if (!data[key.prop]) {
            continue
          }

          found = data[key.prop].find(p => {
            return p.name && p.name.toLowerCase() === sub.toLowerCase().replace(key.prop === 'methods' ? '()' : '', '')
          })
          if (found) {
            found._type = key.prop
            break
          }
        }

        if (!found) { return }

        parsed.subname = found.name
        parsed.name = found._type === 'events' ? found.name : `<${parsed.name}>.${found.name}`
        parsed.description = formatDescription(found.description)
        parsed.meta = found.meta || ''

        if (found.params) {
          if (found._type !== 'events') {
            parsed.name += `(${found.params.map(p => {
              if (p.name.includes('.')) return null
              return `${p.variable ? '...' : ''}${p.optional ? `[${p.name}]` : p.name}`
            }).filter(p => p).join(', ')})`
          }

          const formattedFields = formatPropFields(found.params, 'Parameters')
          for (const f of formattedFields) {
            parsed.fields.push(f)
          }
        } else if (found._type === 'methods') {
          parsed.name += '()'
        }

        parsed.name = `${parsed.name}${found.deprecated ? ' [D]' : ''}`

        if (found.type) {
          parsed.fields.push({
            name: '❯\u2000Types',
            value: formatTypeInline(found.type, found.nullable)
          })
        }

        if (found.returns) {
          let value = formatTypeInline(found.returns.types ? found.returns.types : found.returns,
            found.returns.nullable)

          if (found.returns.description) {
            value += `\n\n${found.returns.description}`
          }

          parsed.fields.push({
            name: '❯\u2000Returns',
            value
          })
        }

        if (found.examples) {
          parsed.fields.push({
            name: '❯\u2000Examples',
            value: bot.utils.formatCode(found.examples.join('\n'), 'js')
          })
        }
      } else {
        parsed.name += data.extends ? ` extends ${data.extends.join(', ')}` : ''

        for (const key of find) {
          if (data[key.prop]) {
            const value = data[key.prop].map(v => `\`${v.name}${v.deprecated ? ' [D]' : ''}\``).join(', ')
            parsed.fields.push({ name: `❯\u2000${key.title}`, value })
          }
        }
      }

      break
    }
    case 1: {
      if (data.type) {
        parsed.fields.push({
          name: '❯\u2000Types',
          value: data.type.map(t => `•\u2000\`${t.join('')}\``).join('\n')
        })
      }

      if (data.props) {
        const formattedFields = formatPropFields(data.props, 'Properties')
        for (const f of formattedFields) {
          parsed.fields.push(f)
        }
      }

      break
    }
    case 2: {
      const find = [
        { prop: 'classes', title: 'Classes' },
        { prop: 'typedefs', title: 'Typedefs' }
      ]

      for (const key of find) {
        if (data[key.prop]) {
          const formattedFields = formatSections(key.title, data[key.prop].map(v => `\`${v.name}\``), ', ')
          for (const f of formattedFields) {
            parsed.fields.push(f)
          }
        }
      }
      break
    }
  }

  if (parsed.description === DESC && data.description) {
    parsed.description = formatDescription(data.description) || parsed.description
  }

  if (parsed.meta && parsed.meta.path && parsed.meta.file && parsed.meta.line) {
    parsed.fields.push({
      name: '❯\u2000Source',
      value: `https://github.com/hydrabolt/discord.js/blob/${docs._version}/${parsed.meta.path}/${parsed.meta.file}` +
        `#L${parsed.meta.line}`
    })
  }

  if (data.name) {
    parsed.fields.push({
      name: '❯\u2000Online docs',
      value: formatLink(data.name, parsed.subname)
    })
  }

  return bot.utils.embed(parsed.name, parsed.description, parsed.fields, parsed.options)
}

const fetchDocs = async version => {
  try {
    const res = await snekfetch.get(`https://raw.githubusercontent.com/hydrabolt/discord.js/docs/${version}.json`)
    if (res.status !== 200) {
      throw new Error('Unexpected error occurred!')
    }
    docs = JSON.parse(res.body)
    docs._version = version
    return true
  } catch (err) {
    if (new RegExp('404 Not Found', 'i').test(err.toString())) {
      throw new Error(`API docs with version \`${version}\` could not be found!`)
    } else {
      throw err
    }
  }
}

exports.info = {
  name: 'apidocs',
  usage: 'apidocs [query]|[version <new version>]',
  description: 'Fetch info from the API docs',
  aliases: ['docs'],
  examples: [
    'apidocs',
    'apidocs Client',
    'apidocs Client.options'
  ]
}
