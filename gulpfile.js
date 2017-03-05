var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat'),
	compass = require('gulp-compass'),
	browserify = require('gulp-browserify');
var sass = require('gulp-ruby-sass');

var coffeeSources = ['components/coffee/tagline.coffee'];
var jsSources = [
	'components/scripts/rclick.js',
	'components/scripts/pixgrid.js',
	'components/scripts/tagline.js',
	'components/scripts/template.js'
];
var sassSources = ['components/sass/style.scss'];

gulp.task('coffee', function() {
	gulp.src(coffeeSources)
		.pipe(coffee({bare: true})
			.on('error', gutil.log))
		.pipe(gulp.dest('components/scripts'))
});

gulp.task('js', function () {
	gulp.src(jsSources)
		.pipe(concat('script.js'))
		.pipe(browserify())
		.pipe(gulp.dest('builds/development/js'))
});

// Per StackOverflow, gulp-css is "blacklisted" due to not being a true gulp plugin
// 
// gulp.task('compass', function () {
// 	gulp.src(sassSources)
// 		.pipe(compass({
// 			sass: 'components/sass',
// 			image: 'builds/development/images',
// 			style: 'expanded'
// 		}))
// 		.on('error', gutil.log)
// 		.pipe(gulp.dest('builds/development/css'))
// });

gulp.task('compass', function() {
   return sass(sassSources, {
     compass: true,
     lineNumbers: true
   }).on('error', gutil.log)
   .pipe(gulp.dest('builds/development/css'))
});


// Gulp Watch task
// Will monitor everything and execute tasks when specific sources change
// 

gulp.task('watch', function () {
	gulp.watch(coffeeSources, ['coffee']);
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
});


// Run all tasks in specified sequence
// Calling this task default, so that it runs by just typing gulp
// 

gulp.task('default', ['coffee', 'js', 'compass']);

