var gulp            = require('gulp')
var sass            = require('gulp-sass');
var sourcemaps      = require('gulp-sourcemaps');
var purify          = require('gulp-purifycss');
var autoprefixer    = require('gulp-autoprefixer');
var browserSync     = require('browser-sync').create();


gulp.task('sass', function () {
  return gulp.src('./www/assets/sass/style.scss')
    //.pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(autoprefixer({
      browsers: ['last 3 versions'],
      cascade: false,
      stream: true
    }))
    .pipe(purify(['./www/**/*.php']))
    .pipe(gulp.dest('www/assets/css'));
//  .pipe(browserSync.stream());
});

gulp.task('browser-sync', function() {
  browserSync.init(['www/assets/css/*.css'], {
    proxy: 'http://testing.local',
  });
  gulp.watch('www/**/*.php').on('change', browserSync.reload);
});

gulp.task('watch', ['browser-sync'], function () {
  gulp.watch(['./www/assets/sass/**/*.scss'], ['sass']);
});

gulp.task('default', ['sass', 'watch']);