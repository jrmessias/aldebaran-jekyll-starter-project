const gulp = require('gulp');
const concat = require('gulp-concat-util');
const sass = require('gulp-sass');
const child = require('child_process');
const gutil = require('gulp-util');
const uglify = require('gulp-uglify');
const imagemin = require('gulp-imagemin');
const browserSync = require('browser-sync').create();
const flatten = require('gulp-flatten');

/*############
 # CONFIG
 ############*/
const files = {
    /***********
     * BrowseSync
     ***********/
    siteRoot: '_site',
    /***********
     * Stylesheets (Sass)
     ***********/
    sassFiles: 'css/**/*.?(s)css',
    sassOptions: {outputStyle: 'compressed'},
    cssDest: 'assets/css',
    /***********
     * Scripts (js)
     ***********/
    jsFiles: [
        'js/site.js',
        'node_modules/jquery/dist/jquery.js',
        'node_modules/tether/dist/js/tether.js',
        'node_modules/bootstrap/dist/js/bootstrap.js',
    ],
    jsOptions: {
        compress: true
    },
    jsDest: 'assets/js',
    /***********
     * Images
     ***********/
    imgFiles: [
        'images/**/*.{png,gif,jpg,jpeg}',
    ],
    imgOptions: {
        optimizationLevel: 5
    },
    imgDest: 'assets/images',
    /***********
     * Fonts
     ***********/
    fontFiles: [
        'node_modules/**/*.{otf,eot,svg,ttf,woff,woff2}',
    ],
    fontOptions: {},
    fontDest: 'assets/fonts',
};

/*############
# TASKS
############*/
/***********
 * Stylesheets (Sass)
 ***********/
gulp.task('sass', function () {
    debugger;
    gulp.src(files.sassFiles)
        .pipe(sass(files.sassOptions)
            .on('error', sass.logError)
        )
        .pipe(concat('site.min.css'))
        .pipe(gulp.dest(files.cssDest));
});

/***********
 * Jekyll
 ***********/
gulp.task('jekyll', function () {
    var jekyllExec = process.platform === "win32" ? "jekyll.bat" : "jekyll";

    const jekyll = child.spawn(jekyllExec, ['build',
        '--watch',
        '--incremental',
        '--drafts'
    ]);

    const jekyllLogger = function (buffer) {
        buffer.toString()
            .split(/\n/)
            .forEach(
                function (message) {
                    gutil.log('Jekyll: ' + message)
                }
            )
    };

    jekyll.stdout.on('data', jekyllLogger);
    jekyll.stderr.on('data', jekyllLogger);
});

/***********
 * Scripts (js)
 ***********/
gulp.task('js', function () {
    gulp.src(files.jsFiles)
        .pipe(uglify(files.jsOptions))
        .pipe(concat('site.min.js'))
        .pipe(gulp.dest(files.jsDest))
});

/***********
 * Images
 ***********/
gulp.task('img', function () {
    return gulp.src(files.imgFiles)
        .pipe(imagemin(files.imgOptions))
        .pipe(gulp.dest(files.imgDest));
});

/***********
 * Fonts
 ***********/
gulp.task('font', function () {
    return gulp.src(files.fontFiles)
        .pipe(flatten())
        .pipe(gulp.dest(files.fontDest));
});

/***********
 * BrowseSync
 ***********/
gulp.task('browserSync', function () {
    browserSync.init({
        files: [files.siteRoot + '/**'],
        port: 4000,
        server: {
            baseDir: files.siteRoot
        },
        reloadDelay: 2000,
        reloadDebounce: 10000
    });
    gulp.watch(files.sassFiles, ['sass']);
    gulp.watch(files.jsFiles, ['js']);
    gulp.watch(files.imgFiles, ['img']);
    gulp.watch(files.fontFiles, ['font']);
});

/*############
 # CALL TASKS
 ############*/
gulp.task('default', ['sass', 'js', 'img', 'font', 'jekyll', 'browserSync']);