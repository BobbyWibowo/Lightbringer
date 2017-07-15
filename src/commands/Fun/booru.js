const booru = require('booru')
const stripIndents = require('common-tags').stripIndents

const DEFAULT = 'gelbooru.com'
const ratings = {
  's': 'Safe',
  'q': 'Questionable',
  'e': 'Explicit',
  'u': 'N/A'
}

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['s:'])
  const site = parsed.options.s ? parsed.options.s : DEFAULT

  const tags = parsed.leftover
  tags.length = Math.min(2, tags.length)

  const x = tags.map(t => `\`${t}\``).join(' and ')
  const searchMessage = tags.length
    ? `${PROGRESS}Searching for \`${x}\`\u2026`
    : `${PROGRESS}Searching for random image\u2026`

  await msg.edit(searchMessage)
  try {
    let images = await booru.search(site, tags, {
      limit: 1,
      random: true
    })
    images = await booru.commonfy(images)
    if (!images.length) {
      throw new Error('No images found!')
    }

    const image = images[0]
    const imageUrl = bot.utils.cleanUrl(image.common.file_url)
    const y = `\`${bot.utils.getHostName(imageUrl)}\``
    const title = tags.length
      ? `Random search result of ${x} on ${y}:`
      : `Random image on ${y}:`

    return msg.edit(stripIndents`
      ${title}
      ${imageUrl}
      ---
      •\u2000**Score:** ${image.common.score}
      •\u2000**Rating:** ${ratings[image.common.rating]}
      •\u2000**Source:** \`${image.common.source || 'N/A'}\``)
  } catch (err) {
    if (err.name === 'booruError') {
      if (new RegExp('You didn\'t give any images', 'i').test(err.message)) {
        throw new Error('No images found!')
      } else {
        throw err.message
      }
    } else {
      throw err
    }
  }
}

exports.info = {
  name: 'booru',
  usage: 'booru [options] [tag1] [tag2]',
  description: 'Search for booru images from various booru sites ' +
    '(looks for a random image from `gelbooru.com` by default)',
  aliases: ['b'],
  options: [
    {
      name: '-s',
      usage: '-s <site>',
      description: 'Choose site for image sourcing (`e621.net`, `e926.net`, `hypnohub.net`, `danbooru.donmai.us`, ' +
        '`konachan.com`, `konachan.net`, `yande.re`, `gelbooru.com`, `rule34.xxx`, `safebooru.org`, `tbib.org`, ' +
        '`xbooru.com`, `youhate.us`, `dollbooru.org`, `rule34.paheal.net`, `lolibooru.moe` and `derpibooru.org`) - ' +
        '[Full list (complete with shortcuts)](https://github.com/AtlasTheBot/booru/blob/HEAD/sites.json)'
    }
  ]
}
