const snekfetch = require('snekfetch')

const TIMEOUT_ID = 'lastfm_timeout'
const OFF_ID = 'lastfm_off'
const DELAY = 7500
const TOGGLE = /^t(oggle)?$/i

exports.nowPlaying = ''

exports.init = async bot => {
  this._stats = bot.managers.stats
  startListening()
}

const stopListening = () => {
  const oldTimeout = this._stats.get(TIMEOUT_ID)

  if (oldTimeout) {
    clearTimeout(oldTimeout)
    this._stats.set(TIMEOUT_ID)
  }
}

const timeout = (modifier = 1) => {
  // Call stopListening() again just in case someone
  // runs the reload command when poll() was still running
  stopListening()

  this._stats.set(TIMEOUT_ID, setTimeout(() => poll(), DELAY * modifier))
}

const poll = async () => {
  if (this._stats.get(OFF_ID)) {
    return timeout(2) // Next poll in 2 * 7500 = 15000 ms
  }

  let res
  try {
    res = await snekfetch.get(`http://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&format=json` +
      `&user=${config.lastFmUsername}&api_key=${config.lastFmApiKey}&limit=1`)
    if (res.status !== 200) {
      throw new Error(res.text)
    }
  } catch (err) {
    console.warn(`[lastfm] ${err}`)
    return timeout(2) // Next poll in 2 * 7500 = 15000 ms
  }

  if (res.status !== 200 || !res.body || !res.body.recenttracks || !res.body.recenttracks.track || !res.body.recenttracks.track[0]) {
    return timeout()
  }

  const track = res.body.recenttracks.track[0]
  let song = ''

  const nowPlaying = track['@attr'] && track['@attr'].nowplaying === 'true'
  if (nowPlaying) {
    const artist = typeof track.artist === 'object' ? track.artist['#text'] : track.artist
    song = `${artist} - ${track.name}`
  }

  if (this.nowPlaying === song) {
    return timeout()
  }

  try {
    await bot.user.setGame(song ? `${song} | ♫ Last.fm` : undefined)
    this.nowPlaying = song

    if (config.statusChannel) {
      await bot.channels.get(config.statusChannel).send(`🎵\u2000${song
        ? `\`Last.fm\`: ${song}`
        : 'Cleared `Last.fm` status message!'}`
      )
    }
  } catch (err) {
    console.warn(`[lastfm] ${err}`)
  }

  return timeout()
}

const startListening = () => {
  stopListening()

  if (!config.lastFmApiKey || !config.lastFmUsername) {
    console.warn(`[lastfm] Last.fm listener disabled due to missing API key and username from config.json!`)
  } else {
    poll()
  }
}

exports.run = async (bot, msg, args) => {
  if (!args.length) {
    return msg.edit(`🎵\u2000Currently playing on \`Last.fm\`: ${this.nowPlaying || 'N/A'}`)
  } else {
    const action = args[0]

    if (TOGGLE.test(action)) {
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
    } else {
      return msg.error('That action is not valid!')
    }
  }
}

exports.info = {
  name: 'lastfm',
  usage: 'lastfm [toggle]',
  description: 'Get currently playing song from Last.fm'
}
