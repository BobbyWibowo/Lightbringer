const Discord = require('discord.js')
const moment = require('moment')

const verificationLevels = ['None', 'Low', 'Medium', '(╯°□°）╯︵ ┻━┻', '┻━┻ ﾐヽ(ಠ益ಠ)ノ彡┻━┻']
const explicitContentFilters = ['No scan', 'Scan from members without a role', 'Scan from all members']

const R_ROLES = /^r(oles)?$/i
const R_MEMBERS = /^m(ember(s)?)?$|^u(ser(s)?)?$/i
const R_CHANNELS = /^c(hannel(s)?)?$/i

exports.run = async (bot, msg, args) => {
  const parsed = bot.utils.parseArgs(args, ['r', 'f:', 'g'])

  if (!(parsed.leftover.length && parsed.options.g) && !bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  if (!msg.guild && !parsed.options.f) {
    return msg.error('This command can only be used in a guild!')
  }

  const guild = parsed.options.f ? bot.utils.getGuild(parsed.options.f) : msg.guild

  await msg.edit(`${consts.p}Fetching guild information\u2026`)

  const res = await bot.utils.fetchGuildMembers(guild, !parsed.options.r)
  const textChannels = guild.channels.filter(c => c.type === 'text')
  const voiceChannels = guild.channels.filter(c => c.type === 'voice')
  const iconURL = guild.iconURL
  const splashURL = guild.splashURL

  let gists, embed
  if (parsed.leftover.length) {
    let title, delimeter, children

    const hasPerm = (c, perms) => c.permissionsFor(guild.me).has(perms)
    const f = t => ` **\`[${t}]\`**`
    const displayPerms = c => `${!hasPerm(c, 'SEND_MESSAGES') && c instanceof Discord.TextChannel ? f('NO_SEND') : ''}${!hasPerm(c, 'CONNECT') && c instanceof Discord.VoiceChannel ? f('NO_CONNECT') : ''}${!hasPerm(c, 'VIEW_CHANNEL') ? f('NO_VIEW') : ''}`

    if (R_ROLES.test(parsed.leftover[0])) {
      title = `Roles in ${guild.name} [${guild.roles.size}]`
      children = guild.roles.sort((a, b) => b.position - a.position).map(r => r.name)
      delimeter = ', '
    } else if (R_MEMBERS.test(parsed.leftover[0])) {
      title = `Members in ${guild.name} [${guild.memberCount}]`
      children = guild.members.map(m => `${bot.utils.escapeMarkdown(m.user.tag)}${(m.user.bot ? ' **`[BOT]`**' : '')}`).sort()
      delimeter = ', '
    } else if (R_CHANNELS.test(parsed.leftover[0])) {
      title = `Channels in ${guild.name} [${guild.channels.size}]`
      const sortPos = (a, b) => a.position - b.position
      children = [].concat(
        `**Text channels [${textChannels.size}]:**`,
        textChannels.sort(sortPos).map(c => `•\u2000${c.name}${displayPerms(c)}`),
        '\n',
        `**Voice channels [${voiceChannels.size}]:**`,
        voiceChannels.sort(sortPos).map(c => `•\u2000${c.name}${displayPerms(c)}`)
      )
      delimeter = '\n'
    } else {
      return msg.error('That action is not valid!')
    }

    if (parsed.options.g) {
      gists = children.join('\n')
    } else {
      embed = bot.utils.formatLargeEmbed('', '', { delimeter, children }, {
        author: {
          name: title,
          icon: iconURL
        }
      })
    }
  } else {
    const online = guild.members.filter(m => {
      return (m.user === bot.user ? bot.user.settings.status : m.user.presence.status) !== 'offline'
    })
    const nestedFields = [
      {
        title: 'Guild Information',
        fields: [
          {
            name: 'ID',
            value: guild.id
          },
          {
            name: guild.owner ? 'Owner' : 'Owner ID',
            value: guild.owner ? `${guild.owner.user.tag} (ID: ${guild.owner.id})` : guild.ownerID
          },
          {
            name: 'Created',
            value: `${moment(guild.createdAt).format(bot.consts.mediumDateFormat)} (${bot.utils.fromNow(guild.createdAt)})`
          },
          {
            name: 'Region',
            value: guild.region
          },
          {
            name: 'Verification',
            value: verificationLevels[guild.verificationLevel]
          },
          {
            name: 'Filter',
            value: explicitContentFilters[guild.explicitContentFilter]
          }
        ]
      },
      {
        title: 'Statistics',
        fields: [
          {
            name: 'Channels',
            value: `${guild.channels.size} – ${textChannels.size} text & ${voiceChannels.size} voice`
          },
          {
            name: 'Members',
            value: `${guild.memberCount} – ${online.size} online`
          },
          {
            name: 'Roles',
            value: guild.roles.size
          }
        ]
      }
    ]

    if (splashURL) {
      // Push to Guild Information section
      nestedFields[0].fields.push({
        name: 'Splash image',
        value: `[${bot.utils.getHostName(splashURL) || 'Click here'}](${splashURL})`
      })
    }

    const myRoles = guild.me.roles.size - 1
    embed = bot.utils.formatEmbed('', `_I have **${myRoles} role${myRoles !== 1 ? 's' : ''}** in this guild\u2026_`,
      nestedFields, {
        thumbnail: iconURL,
        author: { name: guild.name, icon: iconURL }
      }
    )
  }

  if (res.time && embed) {
    embed.setFooter(`Time taken to re-fetch members: ${res.time}`)
  }

  if (parsed.options.g && gists) {
    await msg.edit('🔄\u2000Uploading to GitHub Gists\u2026')
    const r = await bot.utils.gists(gists)
    return msg.success(`<${r}>`, { timeout: -1 })
  } else {
    const color = await bot.utils.getGuildColor(guild)
    const message = parsed.options.f
      ? `Information of the guild which matched the keyword \`${parsed.options.f}\`:`
      : 'Information of the currently viewed guild:'
    return msg.edit(message, {
      embed: embed.setColor(color)
    })
  }
}

exports.info = {
  name: 'guildinfo',
  usage: 'guildinfo [options] [roles|members|channels]',
  description: 'Shows info of the server you are in',
  aliases: ['guild', 'server', 'serverinfo'],
  options: [
    {
      name: '-r',
      usage: '-r',
      description: 'Re-fetches all guild members (recommended with large guild)'
    },
    {
      name: '-f',
      usage: '-f <guild name>',
      description: 'Uses a certain guild instead'
    },
    {
      name: '-g',
      usage: '-g',
      description: 'Uploads to GitHub Gists (to be used with `roles`, `members` or `channels`)'
    }
  ],
  examples: [
    'guildinfo',
    'guildinfo roles',
    'guildinfo -f "discord.js official"'
  ]
}
