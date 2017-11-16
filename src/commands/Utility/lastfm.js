const snekfetch = require('snekfetch')

const TIMEOUT_ID = 'lastfm_timeout'
const OFF_ID = 'lastfm_off'
const DELAY = 7500

const R_TOGGLE = /^t(oggle)?$/i
const R_CONFIG = /^c(onfig(uration)?)?$/i

exports.nowPlaying = ''

exports.init = async bot => {
  this._stats = bot.managers.stats
  this.config = bot.config[this.info.name] || {}
  startListening()
}

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.edit(`🎵\u2000Currently playing on \`Last.fm\`: ${this.nowPlaying || 'N/A'}`)
  } else {
    const action = args[0]

    if (R_TOGGLE.test(action)) {
      if (!this._stats.get(OFF_ID)) {
        this._stats.set(OFF_ID, true)
        stopListening()
        await bot.user.setGame()
        this.nowPlaying = ''
        return msg.success('Disabled `Last.fm` listener.')
      } else {
        this._stats.set(OFF_ID)
        startListening()
        return msg.success('Enabled `Last.fm` listener!')
      }
    } else if (R_CONFIG.test(action)) {
      const apiKey = args[1]
      const username = args[2]

      if (!apiKey || !username) {
        return msg.error(`Usage: \`${bot.config.prefix}${this.info.name} config <apiKey> <username>\``)
      }

      bot.managers.config.set(this.info.name, { apiKey, username })
      return msg.success('Configuration saved!')
    } else {
      return msg.error('That action is not valid!')
    }
  }
}

const stopListening = () => {
  const oldTimeout = this._stats.get(TIMEOUT_ID)

  if (oldTimeout) {
    clearTimeout(oldTimeout)
    this._stats.set(TIMEOUT_ID)
  }
}

const timeoutRecentTrack = (modifier = 1) => {
  // Call stopListening() again just in case someone
  // runs the reload command when getRecentTrack() was still running
  stopListening()

  this._stats.set(TIMEOUT_ID, setTimeout(() => getRecentTrack(), DELAY * modifier))
}

const getRecentTrack = async () => {
  if (this._stats.get(OFF_ID)) {
    return timeoutRecentTrack(2) // Next poll in 2 * 7500 = 15000 ms
  }

  let res
  try {
    res = await snekfetch.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json&user=${this.config.username}&api_key=${this.config.apiKey}&limit=1`)
    if (res.status !== 200) {
      throw new Error(res.text)
    }
  } catch (err) {
    console.warn(`[lastfm] ${err}`)
    return timeoutRecentTrack(2) // Next poll in 2 * 7500 = 15000 ms
  }

  if (res.status !== 200 || !res.body || !res.body.recenttracks || !res.body.recenttracks.track || !res.body.recenttracks.track[0]) {
    return timeoutRecentTrack()
  }

  const track = res.body.recenttracks.track[0]
  let song = ''

  const nowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true'
  if (nowPlaying) {
    const artist = typeof track.artist === 'object' ? track.artist['#text'] : track.artist
    song = `${artist} - ${track.name}`
  }

  if (this.nowPlaying === song) {
    return timeoutRecentTrack()
  }

  try {
    await bot.user.setGame(song ? `${song} | ♫ Last.fm` : undefined)
    this.nowPlaying = song

    if (bot.config.statusChannel) {
      await bot.channels.get(bot.config.statusChannel).send(`🎵\u2000${song
        ? `\`Last.fm\`: ${song}`
        : 'Cleared `Last.fm` status message!'}`
      )
    }
  } catch (err) {
    console.warn(`[lastfm] ${err}`)
  }

  return timeoutRecentTrack()
}

const startListening = () => {
  stopListening()

  if (this.config.apiKey && this.config.username) {
    getRecentTrack()
  } else {
    this._stats.set(OFF_ID, true)
  }
}

exports.info = {
  name: 'lastfm',
  usage: 'lastfm [toggle|config <apiKey> <username>]',
  description: 'Get currently playing song from Last.fm',
  examples: [
    'lastfm toggle',
    'lastfm config 12345678901234567890123456789012 MyUsername'
  ]
}
