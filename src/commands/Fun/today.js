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
  if (msg.guild) {
    bot.utils.assertEmbedPermission(msg.channel, msg.member)
  }

  if (!args.length) {
    throw new Error('You must specify a type!')
  }

  const i = (EVENTS.test(args[0]) ? 'e' : (BIRTHS.test(args[0]) ? 'b' : (DEATHS.test(args[0]) ? 'd' : false)))

  if (!i) {
    return new Error('That type is not available!')
  }

  const prev = msg.content

  const res = await snekfetch.get('http://history.muffinlabs.com/date')
  if (!res || !res.body) {
    throw new Error('Could not fetch data')
  }

  const data = JSON.parse(res.body)

  const title = mapping[i].title
  const source = data.data[mapping[i].source]
  const thing = source[Math.round(Math.random() * (source.length - 1))]

  return msg.edit(prev, { embed:
    bot.utils.formatEmbed(`${title} (${data.date})`, `${thing.text}`, [
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
