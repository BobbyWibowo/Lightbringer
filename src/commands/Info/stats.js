const ostb = require('os-toolbox')

const GIT = 'https://github.com/BobbyWibowo/Lightbringer'

exports.run = async (bot, msg) => {
  if (!bot.utils.hasEmbedPermission(msg.channel)) {
    return msg.error('No permission to use embed in this channel!')
  }

  const previous = msg.content
  const timestamp = new Date().getTime()
  await msg.edit(`${consts.p}Fetching CPU load and memory usage\u2026`)
  const ping = new Date().getTime() - timestamp

  /*
  getos(async (err, res) => {
    try {
      if (err) {
        throw err
      }
  */
  const cpuLoad = await ostb.cpuLoad()
  const memoryUsage = await ostb.memoryUsage()
  return msg.edit(previous, {
    embed:
    bot.utils.formatEmbed('', `*[Click here](${GIT}) to view this self-bot's public GitHub repository\u2026*`,
      [
        {
          title: 'System',
          fields: [
            /*
            {
              name: 'OS',
              value: res.os === 'linux' ? res.dist : res.os
            },
            */
            {
              name: 'CPU load',
              value: `${cpuLoad}%`
            },
            {
              name: 'Memory usage',
              value: `${memoryUsage}%`
            },
            {
              name: 'Heap',
              value: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`
            },
            {
              name: 'Taken',
              value: `${ping}ms`
            },
            {
              name: 'Heartbeat',
              value: `${bot.ping.toFixed(0)}ms`
            },
            {
              name: 'Uptime',
              value: bot.utils.humanizeDuration(bot.uptime, 3, true)
            }
          ]
        },
        {
          title: 'Statistics',
          fields: [
            {
              name: 'Sent',
              value: bot.managers.stats.get('messages-sent').toLocaleString()
            },
            {
              name: 'Received',
              value: bot.managers.stats.get('messages-received').toLocaleString()
            },
            {
              name: 'Mentioned',
              value: bot.managers.stats.get('mentions').toLocaleString()
            },
            {
              name: 'Executed',
              value: bot.managers.stats.get('commands').toLocaleString()
            },
            {
              name: 'Guilds',
              value: bot.guilds.size.toLocaleString()
            },
            {
              name: 'Channels',
              value: bot.channels.size.toLocaleString()
            },
            {
              name: 'Users',
              value: bot.users.size.toLocaleString()
            }
          ]
        },
        {
          title: 'Others',
          fields: [
            {
              name: 'Modules',
              value: bot.commands._count.toLocaleString()
            },
            {
              name: 'Lightbringer',
              value: `[${require('../../../package.json').version}](${GIT})`
            },
            {
              name: 'discord.js',
              value: `[${require('discord.js').version}](https://github.com/hydrabolt/discord.js)`
            },
            {
              name: 'bufferutil',
              value: `[${require('../../../node_modules/bufferutil/package.json').version}]` +
              '(https://github.com/websockets/bufferutil)'
            },
            {
              name: 'Node.js',
              value: `[${process.versions.node}](${process.release.sourceUrl})`
            },
            {
              name: 'Prefix',
              value: `\`${bot.config.prefix}\``
            }
          ]
        }
      ],
      {
        inline: true,
        author: {
          name: 'Lightbringer Statistics',
          icon: 'https://s.fiery.me/5Mb95hqxc2WE6EFSOeLjrCVPjrt0psNa.png',
          url: GIT
        },
        color: '#ff0000',
        footer: 'Ps. "Users" is the amount of users cached by the bot'
      }
    )
  })
  /*
    } catch (err) {
      msg.error(err)
    }
  })
  */
}

exports.info = {
  name: 'stats',
  usage: 'stats',
  description: 'Shows you stats about Lightbringer'
}
