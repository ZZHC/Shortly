gulp    = require('gulp')
webpack = require('webpack-stream')
shelljs = require('shelljs')
named   = require('vinyl-named')

gulp.task 'build', ['clean'], ->
  gulp.src('static/*')
    .pipe gulp.dest('build/Shortly.safariextension')

  gulp.src('source/app.js')
    .pipe named()
    .pipe webpack( require('./webpack.config') )
    .pipe gulp.dest('build/Shortly.safariextension')

gulp.task 'clean', ->
  shelljs.rm '-rf', './build'
