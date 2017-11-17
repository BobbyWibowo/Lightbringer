/*
 * This command should work properly, but I'm trying to decrease
 * the bot's dependencies for the time being. I'll look more into
 * this at a later date.
 */

const popura = require('popura')
const paginate = require('paginate-array')
const { stripIndents } = require('common-tags')
const { XmlEntities } = require('html-entities')
const bbCodeToMarkdown = require('bbcode-to-markdown')
const moment = require('moment')

const resultsPerPage = 10

exports.run = async (bot, msg, args) => {
  if (!bot.config.malUser || !bot.config.malPassword) {
    return msg.error('MyAnimeList username or password is missing from config.json file.')
  }

  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  const parsed = bot.utils.parseArgs(args, ['m', 'l', 'p:', 'i:'])

  if (parsed.leftover.length < 1) {
    return msg.error('You must specify something to search!')
  }

  const query = parsed.leftover.join(' ')
  const source = 'MyAnimeList'

  await msg.edit(`${consts.p}Searching for \`${query}\` on ${source}\u2026`)

  const mal = popura(bot.config.malUser, bot.config.malPassword)
  const auth = await mal.verifyAuth()

  if (auth.username !== bot.config.malUser) {
    return msg.error('MyAnimeList auth did not return the expected value.')
  }

  const res = await (parsed.options.m ? mal.searchMangas(query) : mal.searchAnimes(query))

  if (!res || !res[0]) {
    return msg.error('No matches found!')
  }

  // BEGIN: Utility functions/variables - for the await feature
  const AWAIT_TIMEOUT = 30

  const formatAwaitMessage = (page = 1) => {
    return `Found \`${res.length}\` matches for \`${query}\`:\n` +
    formatResultsList(res, 'Matches', page) + '\n' +
    `Please say an index or say \`p<page>\` to set page within ${AWAIT_TIMEOUT} ` +
    `second${AWAIT_TIMEOUT !== 1 ? 's' : ''} or say \`cancel\` to cancel.`
  }

  const isInputInRange = (i, max) => {
    i = parseInt(i)
    return i > 0 && i <= max
  }

  const formatInvalidIndex = (i, max) => {
    return `\`${i}\` is not a valid index for this query. Valid index: \`1\` to \`${max}\`.`
  }

  const isCancelRequested = input => input.trim().toLowerCase() === 'cancel'

  const parsePageInput = input => {
    const regex = /^p(\d+?)$/i.exec(input)
    if (regex && regex[1]) {
      return parseInt(regex[1])
    }
    return false
  }

  const pageCount = Math.floor((res.length - 1) / 10) + 1
  // END: Utility functions/variables

  // BEGIN: Parsing index - await for user input if necessary
  let index

  if (parsed.options.l) {
    index = -1
  } else if (parsed.options.i) {
    if (isInputInRange(parsed.options.i, res.length)) {
      index = parsed.options.i - 1
    } else {
      return msg.error(formatInvalidIndex(parsed.options.i, res.length))
    }
  } else if (res.length > 1) {
    await msg.edit(formatAwaitMessage(parsed.options.p))

    let collected
    try {
      // Filter function can not be async
      collected = await msg.channel.awaitMessages(tm => {
        if (tm.author.id !== msg.author.id) {
          return false
        }

        if (isInputInRange(parseInt(tm.content), res.length) || isCancelRequested(tm.content)) {
          return true
        }

        // Process request to set page
        try {
          const newPage = parsePageInput(tm.content)

          if (newPage) {
            if (isInputInRange(newPage, pageCount)) {
              msg.edit(formatAwaitMessage(newPage)).then(() =>
                tm.delete())
            } else {
              tm.edit(`${consts.e}${formatInvalidIndex(tm.content, pageCount)}`).then(() =>
                tm.delete(3000))
            }
          } else {
            tm.edit(`${consts.e}${formatInvalidIndex(tm.content, res.length)}`).then(() =>
              tm.delete(3000))
          }

          return false
        } catch (err) {
          // Only log the errors when they occurred - let everything else continue as is
          console.error(`mal.js (awaitMessages): ${err}`)
        }
      }, {
        max: 1,
        time: AWAIT_TIMEOUT * 1000,
        errors: ['time']
      })
    } catch (err) {
      return msg.error(`You did not specify an index within ${AWAIT_TIMEOUT} second${AWAIT_TIMEOUT !== 1 ? 's' : ''}.`)
    }

    const tm = collected.first()
    await tm.delete()

    if (isCancelRequested(tm.content)) {
      return msg.success('The command was cancelled!')
    } else {
      index = parseInt(tm.content) - 1
    }
  } else {
    index = 0
  }
  // END: Parsing index

  if (index < 0) {
    await msg.edit('*This message will self-destruct in 30 seconds.*\n' +
      formatResultsList(res, 'Search Results', parsed.options.p)
    )
    return msg.delete(30000)
  }

  const item = res[index]

  const INVALID = '0000-00-00'
  const startDate = item.start_date === INVALID ? 'N/A' : moment(item.start_date).format(bot.consts.shortDateFormat)
  const endDate = item.end_date === INVALID ? 'N/A' : moment(item.end_date).format(bot.consts.shortDateFormat)

  let footer = `${source} | `

  // Add airing date only if at least one of either
  // start date or end date is not invalid
  if (item.start_date !== 'N/A' || item.end_date !== 'N/A') {
    footer += `${startDate} to ${endDate}`
  } else {
    // Is it appropriate to immediately assume this?
    footer += `Not Yet Aired`
  }

  const embed = bot.utils.formatEmbed(item.title, stripIndents`
    ${item.english ? `**Alternative Title:** ${item.english}` : ''}

    ${bbCodeToMarkdown(new XmlEntities().decode(item.synopsis.replace(/\r\n/g, '')))}`,
    [
      {
        title: 'Information',
        fields: [
          {
            name: 'Score',
            value: `${item.score.toLocaleString()} / 10`
          },
          {
            name: parsed.options.m ? 'Volumes / Chapters' : 'Episodes',
            value: parsed.options.m
              ? `${item.volumes.toLocaleString()} / ${item.chapters.toLocaleString()}`
              : item.episodes.toLocaleString()
          },
          {
            name: 'Type',
            value: item.type
          },
          {
            name: 'Status',
            value: item.status
          }
        ]
      },
      ['Link', `**https://myanimelist.net/${parsed.options.m ? 'manga' : 'anime'}/${item.id}/**`]
    ],
    {
      thumbnail: item.image,
      footer,
      footerIcon: 'https://a.safe.moe/3NOZ3.png',
      color: '#1d439b'
    }
  )

  return msg.edit(`Search result of \`${query}\` at index \`${index + 1}/${res.length}\` on ${source}:`, { embed })
}

const formatResultsList = (res, title, p) => {
  const page = p || 1
  const pagRes = paginate(res, page, resultsPerPage)

  let list = `[${title}] [Page: ${pagRes.currentPage}/${pagRes.totaPages}]\n\n`

  for (let i = 0; i < pagRes.data.length; i++) {
    list += `${bot.utils.pad('  ', ((pagRes.currentPage - 1) * pagRes.perPage) + i + 1, true)}` +
      ` : ${pagRes.data[i].title}`
    if (i < pagRes.data.length - 1) {
      list += '\n'
    }
  }

  if (pagRes.currentPage < pagRes.totaPages) {
    list += `\n   : and ${pagRes.total - (pagRes.currentPage * pagRes.perPage)} more`
  }

  return bot.utils.formatCode(list, 'js')
}

exports.info = {
  name: 'mal',
  usage: 'mal [options] <query>',
  description: 'Search for anime info from MyAnimeList',
  aliases: ['anime', 'myanimelist'],
  options: [
    {
      name: '-m',
      usage: '-m',
      description: 'Search for manga info instead'
    },
    {
      name: '-l',
      usage: '-l',
      description: 'Display list of all results'
    },
    {
      name: '-p',
      usage: '-p <page>',
      description: 'Sets the page of list of all results to show (requires -l to be set)'
    },
    {
      name: '-i',
      usage: '-i <index>',
      description: 'Sets the index of which info to show (not to be used with either -l or -p)'
    }
  ]
}
