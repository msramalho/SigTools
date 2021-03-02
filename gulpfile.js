const gulp = require('gulp')
const {
    src,
    series,
    parallel,
    watch,
    dest
} = require('gulp');

const $ = require('gulp-load-plugins')()

// deployment type and target
// let production = process.env.NODE_ENV === "production";
let target = process.env.TARGET || "chrome";
let environment = process.env.NODE_ENV || "development";

// read target specific configurations
// let generic = JSON.parse(fs.readFileSync(`./config/${environment}.json`));
// let specific = JSON.parse(fs.readFileSync(`./config/${target}.json`));
// let contextObject = Object.assign({}, generic, specific);


let manifestInfo = {
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

// Tasks
function cleanBuild() {
    // remove the build contents
    return src(`./build/${target}`, {
        read: false,
        allowEmpty: true
    }).pipe($.clean())
}

function cleanDist() {
    // remove the dist contents
    return src(`./dist/${target}`, {
        read: false,
        allowEmpty: true
    }).pipe($.clean())
}

function cleanAll() {
    // remove the dist contents
    return src([`./dist/`, `./build/`], {
        read: false,
        allowEmpty: true
    }).pipe($.clean())
}

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

function moveCss() {
    return pipe('./src/css/**/*', `./build/${target}/css`);
}

function moveExtra() {
    return pipe('./src/extra/**/*', `./build/${target}/extra`);
}

function moveIcons() {
    return pipe('./src/icons/**/*', `./build/${target}/icons`);
}

function moveJs() {
    return pipe('./src/js/**/*', `./build/${target}/js`);
}

function moveHtml() {
    return pipe(['./src/changelog.html', './src/options.html'], `./build/${target}`);
}

function zip() {
    // zip all files in the target folder for dist
    return src([`./build/${target}/**/*`, `./build/${target}/**/**/*`])
        .pipe($.zip(`${target}.zip`))
        .pipe(dest('./dist'));
}

// watch for any changes in the source folder
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
exports.zip = series(zip)
exports.clean = series(cleanBuild, cleanDist)
exports.build = series(exports.clean, manifest, parallel(moveHtml, moveCss, moveJs, moveExtra, moveIcons))
exports.dist = series(exports.build, zip)
exports.watch = series(exports.build, startWatching)
exports.cleanAll = cleanAll
exports.default = exports.build;