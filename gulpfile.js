const moduleError = /Error: Cannot find module '([a-zA-Z0-9+_-]+)'/g

const gulp = require('gulp')
const standard = require('gulp-standard')
const spawn = require('child_process').spawn
const version = process.versions.v8.match(/^([0-9]+)\.([0-9]+)\./)
const major = parseInt(version[1], 10)
const minor = parseInt(version[2], 10)

let bot

const paths = {
  srcFiles: 'src/**/!(_)*.js',
  gulpFile: 'gulpfile.js'
}

const kill = () => {
  if (bot) {
    bot.kill()
  }
}

gulp.task('kill', () => {
  kill()
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
  // NOTE: Experimental handler to check async/await compatibility
  if (major < 5 || (major === 5 && minor < 4)) {
    console.error('async/await is not supported in v8 versions before 5.4 (node.js <7.0)')
    process.exit(0)
  }

  const options = { 'stdio': ['inherit', 'inherit', 'pipe'] }
  if (major > 5 || (major === 5 && minor > 4)) {
    bot = spawn('node', ['src/bot.js'], options)
  } else {
    bot = spawn('node', ['--harmony-async-await', 'src/bot.js'], options)
  }

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
      // NOTE: Killed by kill()
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
  kill()
})
