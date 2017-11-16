const snekfetch = require('snekfetch')
const cheerio = require('cheerio')

exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!args.length) {
    return msg.error('You must specify something to search!')
  }

  const y = 'Google'

  await msg.edit(`${consts.p}Searching for \`${args.join(' ')}\` on ${y}\u2026`)
  const res = await snekfetch.get('http://google.com/search?client=chrome&rls=en&ie=UTF-8&oe=UTF-8&q=' + args.join('+'))
  if (res.status !== 200) {
    return msg.error('Could not connect to Google server!')
  }

  const $ = cheerio.load(res.body)
  const results = []
  $('.g').each((i) => {
    results[i] = {}
  })
  $('.g>.r>a').each((i, e) => {
    const raw = e.attribs['href']
    results[i]['link'] = raw.substr(7, raw.indexOf('&sa=U') - 7)
  })
  $('.g>.s>.st').each((i, e) => {
    results[i]['description'] = getText(e)
  })

  const output = results.filter(r => r.link && r.description)
    .slice(0, 5)
    .map(r => `**${r.link}**\n\t${r.description}\n`)
    .join('\n')

  return msg.edit(`Search results of \`${args.join(' ')}\` on ${y}:`, {
    embed: bot.utils.embed('', output, [], {
      footer: 'Google',
      footerIcon: 'https://a.safe.moe/F3RvU.png',
      color: '#4285f4'
    })
  })
}

const getText = children => {
  if (children.children) {
    return getText(children.children)
  }

  return children.map(c => c.children ? getText(c.children) : c.data).join('')
}

exports.info = {
  name: 'google',
  usage: 'google <search>',
  description: 'Searches Google using magic'
}
