gulp    = require('gulp')
webpack = require('webpack-stream')
shelljs = require('shelljs')
named   = require('vinyl-named')

SOURCE_PATTERN = 'source/!(*.template).js'
EXTENSION_PATH = 'build/Shortly.safariextension'

gulp.task 'clean', ->
  shelljs.rm '-rf', './build'

gulp.task 'build:static', ->
  gulp.src('static/*')
    .pipe gulp.dest(EXTENSION_PATH)

gulp.task 'build:js', ->
  gulp.src(SOURCE_PATTERN)
    .pipe named()
    .pipe webpack( require('./webpack.config') )
    .pipe gulp.dest(EXTENSION_PATH)

gulp.task('build', ['clean', 'build:static', 'build:js'])

gulp.task 'watch', ['build'], ->
  gulp.watch(SOURCE_PATTERN, ['build:js'])
