// Get modules
const gulp = require('gulp');
const concat = require('gulp-concat');
const imagemin = require('gulp-imagemin');
const imageminJpegoptim = require('imagemin-jpegoptim');
const pngcrush = require('imagemin-pngcrush');
const minifycss = require('gulp-clean-css');
const purify = require('gulp-purifycss');
const minifyHTML = require('gulp-minify-html');
const uglify = require('gulp-uglify');
const sass = require('gulp-sass');
const browserSync = require('browser-sync');
const critical = require('critical');
const autoprefixer = require('gulp-autoprefixer');
const svgstore = require('gulp-svgstore');
const inject = require('gulp-inject');
const svgmin = require('gulp-svgmin');
const del = require('del');
const sourcemaps = require('gulp-sourcemaps');
const gulpSequence = require('gulp-sequence')
const size = require('gulp-size')

const base_path = './';
const build_path = 'dist/';

//error log function:
function errorLog(error) {
    console.error(error.message);
}

// browser-sync task for starting the server.
gulp.task('browser-sync', function () {
    browserSync({
        server: {
            baseDir: build_path
        },
        files: build_path + "/",
        ghostMode: {
            clicks: true,
            location: true,
            forms: true,
            scroll: true
        },
        notify: true,
        logFileChanges: false,
        open: false
    });
});

gulp.task('clean', function () {
  return del.sync([build_path]);
});

//Move some files to dist
gulp.task('move', function() {
 return gulp.src([
                    base_path + 'tile.png',
                    base_path + 'tile-wide.png',
                    base_path + 'robots.txt',
                    base_path + 'manifest.json',
                    base_path + 'favicon-96x96.png',
                    base_path + 'favicon-32x32.png',
                    base_path + 'favicon-16x16.png',
                    base_path + 'favicon.ico',
                    base_path + 'crossdomain.xml',
                    base_path + 'apple-touch-icon.png',
                    base_path + '.htaccess',
                ])
        .pipe(gulp.dest(build_path));
});

//Task html
gulp.task('html', function () {
    return gulp
        .src('*.html')
        .pipe(minifyHTML({empty: true}))
        .pipe(gulp.dest(build_path))
        .pipe(browserSync.stream());
});

// Task css
gulp.task('css', function () {
    return gulp.src(base_path + 'scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(purify([build_path + 'js/**.js', build_path + '/*.html']))
        .pipe(autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }))
        .pipe(minifycss({level: {1: {specialComments: 0}}}))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(build_path + 'css/'))
        .on('error', errorLog)
        .pipe(browserSync.stream());
});

// Task js app
gulp.task('js', function () {
    return gulp.src(base_path + 'js/main.js')
        .pipe(concat('main.js'))
        .on('error', errorLog)
        .pipe(uglify())
        .pipe(gulp.dest(build_path + 'js/'))
        .pipe(browserSync.stream());
});

// Task js vendor
gulp.task('js-vendor', function () {
    return gulp.src(base_path + 'js/vendor/*.js')
        .pipe(concat('plugins.js'))
        .pipe(uglify())
        .pipe(gulp.dest(build_path + 'js/'))
        .on('error', errorLog)
        .pipe(browserSync.stream());
});

//Task images
gulp.task('images', function () {
    return gulp.src(base_path + 'img/**')
        .pipe(imagemin([
            imageminJpegoptim({
                max: 80,
                progressive: true
            }),
            imagemin.optipng({
                optimizationLevel: 5
            }),
            imagemin.svgo({
                plugins: [{cleanupIDs: false, removeEmptyAttrs: true, removeViewBox: false}]
            })
        ]))
        .pipe(gulp.dest(build_path + 'img/'))
});

//Task svg sprite
gulp.task('svg-sprite', function () {
    return gulp.src(base_path + 'img/svg-sprite/*.svg')
        .pipe(svgmin())
        .pipe(svgstore())
        .pipe(gulp.dest(build_path + 'img/'))
});

// Show total size at the end
gulp.task('size-dist', function() {
    return gulp.src(build_path + '/**/*')
        .pipe(size({showTotal: true, pretty: true}));
});

// Generate & Inline Critical-path CSS
gulp.task('critical', function () {
    critical.generate({
         base: build_path,
         src: 'index.html',
         css: build_path + 'css/main.css',
         dest: 'index.html',
         inline: true,
         minify: true,
         extract: true,
         ignore: ['font-face'],
         width: 1300,
         height: 900
     })
 });

gulp.task('watch', function () {
    gulp.watch(base_path + 'scss/**', ['css']);
    gulp.watch(base_path + 'js/*', ['js']);
    gulp.watch(base_path + 'js/vendor/*', ['js-vendor']);
    gulp.watch(base_path + 'img/**', ['images']).on('change', browserSync.reload);
    gulp.watch(base_path + 'img/svg-sprite/*.svg', ['svg-sprite']).on('change', browserSync.reload);
    gulp.watch(base_path + '*.html', ['html']).on('change', browserSync.reload);
});

// The default task (called when you run `gulp` from cli)
gulp.task('default', gulpSequence('clean', ['move', 'html', 'js', 'js-vendor', 'images', 'svg-sprite'], 'css', ['browser-sync', 'watch'], 'size-dist'))

// Task when ready for production
gulp.task('production', gulpSequence('clean', ['move', 'html', 'js', 'js-vendor', 'images', 'svg-sprite'], 'css', 'critical', 'size-dist'))