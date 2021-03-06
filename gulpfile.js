var gulp = require('gulp');
var gutil = require('gulp-util');
var coffee = require('gulp-coffee');
var concat = require('gulp-concat'),
	compass = require('gulp-compass'),
	gulpif = require('gulp-if'),
	uglify = require('gulp-uglify'),
	jsonMinify = require('gulp-jsonminify'),
	minifyHTML = require('gulp-minify-html'),
	imageMin = require('gulp-imagemin'),
	pngCrush = require('imagemin-pngcrush'),
	browserify = require('gulp-browserify');
var sass = require('gulp-ruby-sass'),
	connect = require('gulp-connect');

var env, 
	coffeeSources, 
	jsSources, 
	sassSources, 
	htmlSources, 
	jsonSources, 
	outputDir,
	sassStyle;

// To run in production use command NODE_ENV=production gulp
env = process.env.NODE_ENV || 'development'; // Specify environment (development or production). Default behavior is development.

if(env == 'development') {
	outputDir = 'builds/development';
	sassStyle = 'expanded';
} else {
	outputDir = 'builds/production';
	sassStyle = 'compressed';
}

coffeeSources = ['components/coffee/tagline.coffee'];
jsSources = [
	'components/scripts/rclick.js',
	'components/scripts/pixgrid.js',
	'components/scripts/tagline.js',
	'components/scripts/template.js'
];
sassSources = ['components/sass/style.scss'];
htmlSources = [outputDir + '/*.html'];
jsonSources = [outputDir + '/js/*.json'];

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
		.pipe(gulpif(env === 'production', uglify()))
		.pipe(gulp.dest(outputDir + '/js'))
		.pipe(connect.reload())
});

// Per StackOverflow, gulp-css is "blacklisted" due to not being a true gulp plugin
// 
// gulp.task('compass', function () {
// 	gulp.src(sassSources)
// 		.pipe(compass({
// 			sass: 'components/sass',
// 			image: outputDir + '/images',
// 			style: 'expanded'
// 		}))
// 		.on('error', gutil.log)
// 		.pipe(gulp.dest(outputDir + '/css'))
// });

gulp.task('compass', function() {
   return sass(sassSources, {
     compass: true,
     lineNumbers: true,
     style: sassStyle
   }).on('error', gutil.log)
   .pipe(gulp.dest(outputDir + '/css'))
   .pipe(connect.reload())
});


// Gulp Watch task
// Will monitor everything and execute tasks when specific sources change
// 

gulp.task('watch', function () {
	gulp.watch(coffeeSources, ['coffee']);
	gulp.watch(jsSources, ['js']);
	gulp.watch('components/sass/*.scss', ['compass']);
	gulp.watch('builds/development/*.html', ['html']);
	gulp.watch('builds/development/js/*.json', ['json']);
	gulp.watch('builds/development/images/**/*.*', ['images']);
});


// Gulp Connect task
// Will spin up server and auto reload page on change
// 

gulp.task('connect', function() {
	connect.server({
		root: outputDir,
		livereload: true
	});
});

// HTML reload task

gulp.task('html', function() {
	gulp.src('builds/development/*.html')
		.pipe(gulpif(env === 'production', minifyHTML()))
		.pipe(gulpif(env === 'production', gulp.dest(outputDir)))
		.pipe(connect.reload())
});

// JSON reload task

gulp.task('json', function() {
	gulp.src('builds/development/js/*.json')
		.pipe(gulpif(env === 'production', jsonMinify()))
		.pipe(gulpif(env === 'production', gulp.dest('builds/production/js')))
		.pipe(connect.reload());
});


// Image compression task

gulp.task('images', function() {
	gulp.src('builds/development/images/**/*.*')
		.pipe(gulpif(env === 'production', imageMin({
			progressive: true,
			svgoPlugins: [{ removeViewBox: false }],
			use: [pngCrush()]
		})))
		.pipe(gulpif(env === 'production', gulp.dest('builds/production/images')))
		.pipe(connect.reload());
});


// Run all tasks in specified sequence
// Calling this task default, so that it runs by just typing gulp
// 

gulp.task('default', ['html', 'json', 'coffee', 'js', 'compass', 'images', 'connect', 'watch']);

