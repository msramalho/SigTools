const gulp = require('gulp')
const {
    src,
    series,
    parallel,
    watch,
    dest
} = require('gulp');
const $ = require('gulp-load-plugins')()


/**
 * The target browser. Used to customize the manifest and choose the destination
 * folder for builds and distribution packaging 
 * @type {('chrome' | 'firefox' | 'opera')}
 */
const target = process.env.TARGET || "chrome";

/** 
 * The environment. Used to disable the background script on development
 * @type {('production' | 'development' )}
 */
const environment = process.env.NODE_ENV || "development";

/**
 * 
 */
const manifestInfo = {
    dev: {
        "background": {
            "scripts": [
                // "js/livereload.js",
            ]
        }
    },
    firefox: {
        "applications": {
            "gecko": {
                "id": "{901c6ba2-023e-4cab-9842-2a8c9d051a15}"
            }
        }
    }
}

// Should there be a need for scss
// function styles() {
//     // convert scss to css in build folder
//     // return src('src/styles/**/*.scss')
//         .pipe(plumber())
//         .pipe($.sass.sync({
//             outputStyle: 'expanded',
//             precision: 10,
//             includePaths: ['.']
//         }).on('error', $.sass.logError))
//         .pipe(dest(`build/${target}/styles`))
// }

/** Task: Delete 'build' folder for current target browser */
function cleanBuild() {
    // remove the build contents
    return src(`./build/${target}`, {
        read: false,
        allowEmpty: true
    }).pipe($.clean())
}

/** Task: Delete 'dist' folder for current target browser */
function cleanDist() {
    // remove the dist contents
    return src(`./dist/${target}`, {
        read: false,
        allowEmpty: true
    }).pipe($.clean())
}

/** Task: Delete parent 'dist' and 'build' folders */
function cleanAll() {
    // remove the dist contents
    return src([`./dist/`, `./build/`], {
        read: false,
        allowEmpty: true
    }).pipe($.clean())
}

/** Task: Generates the manifest to meet different browser requirements */
function manifest() {
    // append specific info to manifest and place it in the target folder
    return src('./manifest.json')
        .pipe($.mergeJson({
            fileName: "manifest.json",
            jsonSpace: " ".repeat(4),
            endObj: target === "firefox" ? manifestInfo.firefox : manifestInfo.dev,
            // if development environment, disable the background script
            edit: (parsedJson, file) => {
                if (environment === 'development') {
                    delete parsedJson.background;
                }
                return parsedJson;
            }
        }))
        .pipe(gulp.dest(`./build/${target}`))
}

/** Task: Copy CSS folder from `src/` to `build/` */
function moveCss() {
    return pipe('./src/css/**/*', `./build/${target}/css`);
}

/** Task: Copy extra folder from `src/` to `build/` */
function moveExtra() {
    return pipe('./src/extra/**/*', `./build/${target}/extra`);
}

/** Task: Copy icons folder from `src/` to `build/` */
function moveIcons() {
    return pipe('./src/icons/**/*', `./build/${target}/icons`);
}

/** Task: Copy javascript folder from `src/` to `build/` */
function moveJs() {
    return pipe('./src/js/**/*', `./build/${target}/js`);
}

/** Task: Copy html files from `src/` to `build/` */
function moveHtml() {
    return pipe(['./src/changelog.html', './src/options.html'], `./build/${target}`);
}

/** Task: Zips each browser build inside the `dist/` folder. Assumes build completed */
function zip() {
    // zip all files in the target folder for dist
    return src([`./build/${target}/**/*`, `./build/${target}/**/**/*`])
        .pipe($.zip(`${target}.zip`))
        .pipe(dest('./dist'));
}

/** Task: Watch for any changes in the source folder */
function startWatching() {
    $.livereload.listen()
    watch(['./src/*', './src/**/*', './src/**/**/*']).on("change", () => {
        exports.build()
        $.livereload.reload()
    });
}

// Helpers
function pipe(src, ...transforms) {
    return transforms.reduce((stream, transform) => {
        const isDest = typeof transform === 'string'
        return stream.pipe(isDest ? gulp.dest(transform) : transform)
    }, gulp.src(src))
}

// Export tasks
exports.clean = series(cleanBuild, cleanDist);
exports.build = series(
    exports.clean,
    manifest,
    parallel(moveHtml, moveCss, moveJs, moveExtra, moveIcons)
);
exports.dist = series(exports.build, zip);
exports.watch = series(exports.build, startWatching);
exports.cleanAll = cleanAll;
exports.default = exports.build;
