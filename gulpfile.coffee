gulp    = require('gulp')
webpack = require('webpack-stream')
shelljs = require('shelljs')
named   = require('vinyl-named')

EXTENSION_PATH = 'build/Shortly.safariextension'

gulp.task 'clean', ->
  shelljs.rm '-rf', './build'

gulp.task 'build:static', ->
  gulp.src('static/*')
    .pipe gulp.dest(EXTENSION_PATH)

gulp.task 'build:js', ->
  gulp.src(['source/app.js', 'source/libs.js', 'source/api-keys.js'])
    .pipe named()
    .pipe webpack( require('./webpack.config') )
    .pipe gulp.dest(EXTENSION_PATH + '/js')

gulp.task('build', ['clean', 'build:static', 'build:js'])

gulp.task 'watch', ['build'], ->
  gulp.watch(['static/*', 'static/*/*'], ['build:static'])
  gulp.watch(['source/*', 'source/*/*'], ['build:js'])
