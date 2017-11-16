const snekfetch = require('snekfetch')

const EVENTS = /^e(vents)?$/i
const BIRTHS = /^b(irths)?$/i
const DEATHS = /^d(eaths)?$/i

const mapping = {
  'e': { title: 'What happened today in history?', source: 'Events' },
  'b': { title: 'Who was born today in history?', source: 'Births' },
  'd': { title: 'Who passed away today in history?', source: 'Deaths' }
}

exports.run = async (bot, msg, args) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!args.length) {
    return msg.error('You must specify a type!')
  }

  let mappingIndex
  if (EVENTS.test(args[0])) {
    mappingIndex = 'e'
  } else if (BIRTHS.test(args[0])) {
    mappingIndex = 'b'
  } else if (DEATHS.test(args[0])) {
    mappingIndex = 'd'
  }

  if (!mappingIndex) {
    return msg.error('That type is not available!')
  }

  const prev = msg.content

  const res = await snekfetch.get('http://history.muffinlabs.com/date')
  if (res.status !== 200) {
    return msg.error('Could not fetch data!')
  }

  const data = JSON.parse(res.body)

  const title = mapping[mappingIndex].title
  const source = data.data[mapping[mappingIndex].source]
  const thing = source[Math.round(Math.random() * (source.length - 1))]

  return msg.edit(prev, {
    embed: bot.utils.formatEmbed(`${title} (${data.date})`, `${thing.text}`, [
      {
        title: 'Information',
        fields: [
          {
            name: 'Year',
            value: thing.year
          },
          {
            name: `Wikipedia link${thing.links.length !== 1 ? 's' : ''}`,
            value: thing.links.map(l => `[${l.title}](${bot.utils.cleanUrl(l.link)})`).join(', ')
          }
        ]
      }
    ])
  })
}

exports.info = {
  name: 'today',
  usage: 'today <events|births|deaths>',
  description: 'Gives a random thing that happened today in history from http://history.muffinlabs.com/date'
}
