var gulp = require('gulp'),
    rename = require('gulp-rename'),
    minifyCSS = require('gulp-clean-css'),
    uglify = require('gulp-uglify'),
    del = require('del'),
    wrap = require('gulp-wrap'),
    compass = require('gulp-compass');

gulp.task('compass', function() {
  return gulp.src('src/scss/sap.scss')
    .pipe(compass({
      css: 'tmp',
      sass: 'src/scss/',
    }));
});

gulp.task('minify-css', function(){
  return gulp.src('tmp/sap.css')
    .pipe(minifyCSS({processImport: false}))
    .pipe(rename({suffix: '.min'}))
    .pipe(gulp.dest('dist'));
});

gulp.task('compress', function(){
  return gulp.src('src/js/sap.js')
    .pipe(wrap('(function($){ <%= contents %> })(jQuery);'))
    .pipe(uglify())
    .pipe(rename({suffix:".min"}))
    .pipe(gulp.dest('dist'));
});

gulp.task('copy-html', function(){
  return gulp.src('src/html/sap.html')
    .pipe(gulp.dest('dist'));
});

gulp.task('clean', function(cb) {
  return del('tmp', cb); 
});

gulp.task('build', ['compass', 'copy-html', 'minify-css', 'compress', 'clean']); 