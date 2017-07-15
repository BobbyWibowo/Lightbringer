const fse = require('fs-extra')
const path = require('path')

exports.migrate = async (bot, base) => {
  await migrateConfig(bot, base)
  await migrateDBName(bot, base)
  await migrateFromDB(bot, base)
}

const migrateConfig = async (bot, base) => {
  const oldPath = path.resolve(base, 'config.json')
  const newPath = path.resolve(base, '../config.json')
  const newNewPath = path.resolve(base, '../data/configs/config.json')

  if (fse.existsSync(oldPath)) {
    try {
      fse.moveSync(oldPath, newPath)
    } catch (err) {
      throw new Error(`Failed to migrate config.json!\n${err}`)
    }
  }

  if (fse.existsSync(newPath)) {
    try {
      fse.moveSync(newPath, newNewPath)
    } catch (err) {
      throw new Error('Failed to migrade config.json to configs!')
    }
  }
}

const migrateDBName = async (bot, base) => {
  const oldDataPath = path.resolve(base, '../data/tags')
  const newDataPath = path.resolve(base, '../data/db')

  if (fse.existsSync(oldDataPath)) {
    try {
      fse.renameSync(oldDataPath, newDataPath)
    } catch (err) {
      throw new Error('Failed to rename tags folder!')
    }
  }
}

const migrateFromDB = async (bot, base) => {
  const dbPath = path.resolve(base, '../data/db')

  if (fse.existsSync(dbPath)) {
    const XPDB = require('xpdb')
    const db = new XPDB(dbPath)

    const tags = bot.storage('tags')
    const shortcuts = bot.storage('shortcuts')
    const mentions = bot.storage('mentions')

    const entries = await db.entries()

    entries.forEach(entry => {
      if (entry.key.startsWith('tags.')) {
        const key = entry.key.substr(5)
        tags.set(key, entry.value)
      } else if (entry.key.startsWith('shortcuts.')) {
        const key = entry.key.substr(10)
        shortcuts.set(key, entry.value)
      } else if (entry.key.startsWith('mentions.')) {
        const key = entry.key.substr(9)
        mentions.set(key, entry.value)
      }
    })

    tags.save()
    shortcuts.save()
    mentions.save()

    db.unwrap().close(() => {
      fse.renameSync(dbPath, `${dbPath}-backup-${Date.now()}`)
    })
  }
}
