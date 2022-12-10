var gulp = require('gulp'),
  glob = require('glob'),
  jade = require('gulp-jade'),
  sass = require('gulp-sass')(require('sass')),
  concat = require('gulp-concat'),
  minifyJS = require('gulp-uglify'),
  marked = require('marked'),
  rename = require('gulp-rename'),
  minifyCSS = require('gulp-minify-css'),
  minifyHTML = require('gulp-minify-html'),
  puppeteer = require('puppeteer'),
  livereload = require('gulp-livereload');

var connect = require('connect'),
  rimraf = require('rimraf'),
  pathUtil = require('path'),
  fs = require('fs'),
  safeps = require('safeps');

var paths = {
  'js': ['js/_*.js', 'js/[!_]*.js'],
  'css': 'scss/[!_]*.scss',
  'html': 'jade/[!_]*.jade',
  'data': 'jade/data/[!_]*.json',
  'static': 'static/**/*'
};
var staticPath = pathUtil.join( __dirname, "static/" );
var outPath = pathUtil.join( __dirname, "out/" );
var deployRepo = "git@github.com:pandringa/pandringa.github.io.git";

function Async(p) {
   return new Promise((res, rej) => p.on('error', err => rej(err)).on('end', () => res()));
}

//Components
var compiler = {
  scripts: function() {
    return Async(gulp.src(paths.js)
      .pipe(minifyJS())
      .pipe( concat('main.js') )
      .pipe( gulp.dest( pathUtil.join(outPath, 'js/') ) )
    )
  },
  styles: function() {
    return Async(gulp.src(paths.css)
          .pipe(sass({outputStyle: 'compressed'}))
          .on('error', function (err) { console.log(err.message); })
      .pipe( minifyCSS() )
      .pipe( gulp.dest( pathUtil.join(outPath+'css/') ) )
          .pipe(livereload())
    )
  },
  pages: function() {
    var data = {};
    glob.sync(paths.data).forEach(file => {
      data[ file.match(/\/(\w+)\.json$/)[1] ] = JSON.parse(fs.readFileSync(file))
    })

    return Async(gulp.src(paths.html)
          .pipe(jade({
              locals: {...data, md: s => marked.inlineLexer(s,[]) }
            }))
      .pipe( minifyHTML() )
      .pipe( rename(path => {
        if(path.basename != 'index'){
          path.dirname += '/'+path.basename;
          path.basename = 'index'
        }
      }))
      .pipe( gulp.dest(outPath) )
        .pipe(livereload())
    )
  },
  static:  function() {
    return Async(gulp.src(paths.static).pipe( gulp.dest(outPath) ));
  },
  dotfiles: function(done) {
    fs.mkdirSync( pathUtil.join(outPath) );
    fs.writeFileSync( pathUtil.join(outPath)+'.gitignore', '.DS_Store');
    fs.writeFileSync( pathUtil.join(outPath)+'.nojekyll', '');
    return done();
  },
  clean: function(done) {
    return new Promise(function(resolve, reject) {
      rimraf( pathUtil.join(outPath), function(err) {
        if(err) return reject(err);
        resolve();
      });
    });
  },
  resume: function(inputName, outputName) {
    inputName = inputName || 'index.html'
    if(!outputName) outputName = inputName;

    return puppeteer.launch().then(async browser => {
      const page = await browser.newPage();
      await page.goto('file://'+pathUtil.join(outPath, inputName), {waitUntil: 'networkidle2'});
      await page.pdf({path: './resumes/'+outputName+'.pdf', pageRanges: '1'});
      await browser.close();
    });
  }
}
gulp.task('clean', compiler.clean);
gulp.task('dotfiles', compiler.dotfiles);
gulp.task('scripts', compiler.scripts);
gulp.task('styles', compiler.styles);
gulp.task('pages', compiler.pages);
gulp.task('static', compiler.static);
gulp.task('resumes', () =>
  compiler.resume('index.html', 'resume')
    .then(() => compiler.resume('tech_resume/index.html', 'tech_resume'))
    .then(() => gulp.src('./resumes/resume.pdf').pipe(gulp.dest(outPath)) )
);

// Methods
gulp.task('compile', 
  gulp.series(
    'clean',
    gulp.parallel(
      'dotfiles',
      'scripts',
      'styles',
      'pages',
      'static'
    ),
    'resumes'
  )
);

gulp.task('watch', function(done) {
  gulp.watch(paths.js, compiler.scripts);
  gulp.watch('scss/**/*', compiler.styles);
  gulp.watch('jade/**/*', compiler.pages);
  gulp.watch(paths.static, compiler.static);
  return done();
});

gulp.task('server', gulp.series('compile', 'watch', function() {
  livereload.listen();
  connect()
    .use(connect.static('out'))
    .listen(9000);
  console.log("Server listening on port 9000...");
}));

gulp.task('pushRemote', function(done) {
  // Get last commit line
  safeps.spawnCommand('git', ['log', '--oneline'], {cwd: __dirname}, function(err, stdout) {
    if(err){
      console.log("ERROR getting git log", err);
      return done(err);
    } 
    var lastCommit = stdout.split('\n')[0];
    console.log("Last commit", lastCommit);
    var gitCommands = [
      ['init'],
      ['add', '--all', '--force'],
      ['commit', '-m', lastCommit],
      ['push', '--quiet', '--force', deployRepo, "main"]
    ]
    // Run git commands
    safeps.spawnCommands('git', gitCommands, {cwd:outPath, stdio:'inherit'}, function(err){
      if(err){
        console.log("ERROR with git commands", err);
        return done(err); 
      } 
      return done();
    });
  });
});

gulp.task('resetRemote', function(done) {
  rimraf( pathUtil.join(outPath, ".git"), function(err) {
    if(err) return done(err);
    done();
  });
});

gulp.task('deploy', gulp.series('compile', 'pushRemote', 'resetRemote'));

gulp.task('default', gulp.series('server'));