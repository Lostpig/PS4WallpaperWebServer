'use strict'

let path          = require('path')
let gulp          = require('gulp')
let babel         = require('gulp-babel')

gulp.task('build', (cb) => {
	gulp.src('./src/**.js')
	.pipe(babel({
		presets: ['es2015']
	}))
	.pipe(gulp.dest('./dist'))
})

gulp.task('default', ['build'])
