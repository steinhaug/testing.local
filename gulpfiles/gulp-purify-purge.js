/**
 * My Gulp Purify && PurgeCSS
 * @ri7nz
 * don't forget, install save-dependencies
 * $ npm install --save gulp gulp-purifycss gulp-purgecss gulp-postcss
 */
// https://gist.github.com/ri7nz/2b44f02b857303695ca1478c6efcf290
var gulp        = require('gulp');
var purifycss   = require('gulp-purifycss');
var purgecss    = require('gulp-purgecss');

gulp.task('purgecss', () => {
    return gulp.src('./build/**/*.css')
        .pipe(purgecss({
            content: ['./build/**/*.js','./build/**/*.html' ]
        }))
        .pipe(gulp.dest('./build/'));

});

gulp.task('purifycss', () => {
    return gulp.src('./build/**/*.css')
        .pipe(purifycss(
           ['./build/**/*.js','./build/**/*.html' ]
        ))
        .pipe(gulp.dest('./build/'));
});