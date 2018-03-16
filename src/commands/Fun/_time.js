const snekfetch = require('snekfetch')
const moment = require('moment')

const timeIs = 'https://time.is/'

exports.run = async (bot, msg, args) => {
  const location = args.join(' ') || bot.config.defaultCity

  if (!location) {
    return msg.error('Please specify a location to lookup!')
  }

  const res = await snekfetch.get(`${timeIs}${location}`)
  if (res.status !== 200) {
    return msg.error('Could not connect to time.is server!')
  }

  const text = res.text || res.body.toString()

  const date = text.match(new RegExp('<div id="dd" class="w90 tr" onclick="location=\'/calendar\'" ' +
    'title="Click for calendar">([^]+?)</div>'))[1]
  const time = text.match(/<div id="twd">([^]+?)<\/div>/)[1]
    .replace(/<span id="ampm" style="font-size:21px;line-height:21px">(AM|PM)<\/span>/, ' $1')
  const place = text.match(/<div id="msgdiv"><h1>Time in ([^]+?) now<\/h1>/)[1]
  const clock = bot.consts.clocks[parseInt(time.split(':')[0], 10) % 12]

  const _moment = moment(`${date} ${time}`, 'dddd, MMMM D, YYYY HH:mm:ss A')
  return msg.edit(`${clock} The time in '${place}' is ${_moment.format(bot.consts.fullDateFormat)}.`)
}

exports.info = {
  name: 'time',
  usage: 'time <location>',
  description: 'Prints current time in yours or a particular location (using Time.is)',
  credits: '1Computer1'
}
