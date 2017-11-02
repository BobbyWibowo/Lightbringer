const snekfetch = require('snekfetch')

const HELP = /^(h(elp)?|\?)$/i
const LIST = /^(ls|list|s(earch)?)$/i
const INFO = /^(i(nf(o)?)?)$/i

let templates = []

const _loadMeme = async url => {
  const res = await snekfetch.get(url)
  templates.push({
    name: url.replace(/https:\/\/memegen\.link\/api\/templates\/(.*)/, '$1'),
    url: url.replace('/api/templates', ''),
    styles: res.body.styles
  })
}

const getMeme = name => {
  return templates.find(m => m.name.toLowerCase() === name.toLowerCase())
}

const cleanInput = input => {
  if (!input) {
    return ''
  }

  return input
    .replace(/"/g, '\'\'').replace(/#/g, '~h')
    .replace(/-/g, '--').replace(/_/g, '__')
    .replace(' ', '_').replace(/\?/g, '~q')
    .replace(/%/g, '~p').replace(/\//g, '~s')
}

exports.init = async bot => {
  try {
    const res = await snekfetch.get('https://memegen.link/templates/')
    templates = []

    const promises = []
    for (const key in res.body) {
      promises.push(_loadMeme(res.body[key]))
    }

    await Promise.all(promises)
    templates = templates.filter(e => !!e)
    templates.sort((a, b) => a.name.localeCompare(b.name))
  } catch (err) {
    console.error(err)
  }
}

exports.run = async (bot, msg, args) => {
  if (templates.length < 1) {
    return msg.error('The memes haven\'t loaded yet!')
  }

  if (HELP.test(args[0])) {
    return bot.commands.get('help').run(bot, msg, 'meme')
  }

  if (LIST.test(args[0])) {
    await msg.delete()
    const m = await msg.channel.send({
      embed: bot.utils.embed('Available Memes', '*This message will vanish in 30 seconds*\n\n' + templates.map(meme => {
        return `\`${meme.name}\``
      }).join(', '))
    })
    return m.delete(30000)
  }

  if (INFO.test(args[0])) {
    if (args.length < 2) {
      return msg.error('You must provide a meme to get info about!')
    }

    const info = getMeme(args[1])
    if (!info) {
      return msg.error(`That is not a valid meme! Do \`${config.prefix}${this.info.name} list\` to see available memes.`)
    }

    let styles
    if (info.styles && info.styles.length > 1) {
      styles = info.styles.map(s => `\n- \`${s}\``).join('')
    } else {
      styles = 'None'
    }

    await msg.delete()
    const m = await msg.channel.send({
      embed: bot.utils.embed(`\`${info.name}\``, `Styles: ${styles}`)
    })
    return m.delete(15000)
  }

  const input = args.join(' ')
  const parts = input.split('|').map(p => p.trim())

  const meme = getMeme(parts[0])
  if (!meme) {
    return msg.error(`That is not a valid meme! Do \`${config.prefix}${this.info.name} list\` to see available memes.`)
  }

  let url = `${meme.url}/${cleanInput(parts[1]) || '_'}/${cleanInput(parts[2]) || '_'}.jpg`
  if (parts[3]) url += `?alt=${parts[3]}`

  await msg.edit('🔄')
  await msg.channel.send({
    files: [{
      attachment: url,
      name: parts[0] + '.jpg'
    }]
  })
  return msg.delete()
}

exports.info = {
  name: 'meme',
  usage: 'meme list | info <name> | [<name> | [<line 1>] | [<line 2>] | [style]]',
  examples: [
    'meme info sad-biden',
    'meme facepalm | please, oh please | rtfm',
    'meme sad-biden | sad joe biden | doesn\'t have discord | scowl'
  ]
}
