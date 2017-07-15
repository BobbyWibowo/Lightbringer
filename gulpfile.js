const moduleError = /Error: Cannot find module '([a-zA-Z0-9+_-]+)'/g

const gulp = require('gulp')
const standard = require('gulp-standard')
const spawn = require('child_process').spawn

let bot

const paths = {
  srcFiles: 'src/**/!(_)*.js',
  configFiles: 'data/configs/config.json',
  gulpFile: 'gulpfile.js'
}

const killBot = () => {
  if (bot) bot.kill()
}

gulp.task('kill', () => {
  killBot()
})

gulp.task('standard', () => {
  gulp.src([
    paths.srcFiles,
    paths.gulpFile
  ]).pipe(standard())
    .pipe(standard.reporter('default', {
      breakOnError: true,
      quiet: true,
      showRuleNames: true
    }))
})

gulp.task('main', ['kill', 'standard'], () => {
  bot = spawn('node', ['src/bot.js'], { 'stdio': ['inherit', 'inherit', 'pipe'] })

  bot.stderr.on('data', data => {
    process.stderr.write(data)
    if (moduleError.test(data.toString())) {
      console.error(`
#######################################################################################################################
Node has failed to load a module! If you just updated, you may need to run 'yarn' again to install/update dependencies.
'yarn' will attempt to run now and install the dependencies for you.
#######################################################################################################################
`)
      spawn('yarn', ['--force'], { 'stdio': 'inherit' }).on('close', code => {
        if (code === 0) {
          console.log(`New modules have been installed. The bot will now restart.`)
          gulp.start('main')
        }
      })
    }
  })

  bot.on('close', code => {
    if (code === null) {
      // NOTE: Killed by killBot()
      return
    }

    if (code === 42) {
      // NOTE: Restart
      console.error('Restart code detected.')
      gulp.start('main')
    } else if (code === 666) {
      // NOTE: Full process stop
      console.log('Process exit code detected.')
      process.exit(1)
    }
  })
})

gulp.task('default', ['main'])

process.on('exit', () => {
  killBot()
})
