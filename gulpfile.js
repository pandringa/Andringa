var gulp = require('gulp'),
	stylus = require('gulp-stylus'),
	jade = require('gulp-jade'),
	concat = require('gulp-concat'),
	minifyJS = require('gulp-uglify'),
	minifyCSS = require('gulp-minify-css'),
	minifyHTML = require('gulp-minify-html'),
	imagemin = require('gulp-imagemin');

var connect = require('connect'),
	jadeCompiler = require('jade'),
	rimraf = require('rimraf'),
	pathUtil = require('path'),
	fs = require('fs'),
	safeps = require('safeps');

var paths = {
  'js': ['js/lib/*.js', 'js/*.js'],
  'img': 'img/**/*',
  'css': 'css/[!_]*.styl',
  'html': 'html/[!_]*.jade',
  'static': 'static/**/*'
};
var outPath = pathUtil.join( __dirname, "out/" );
var deployRepo = "https://github.com/pandringa/test-deploy.git";

var jadeIncludeSection = function(name){
	return jadeCompiler.renderFile( pathUtil.join(__dirname, "html/_sections", "_"+name)+".jade", {section: jadeIncludeSection} );
}

//Components
var compiler = {
	scripts: function() {
		return gulp.src(paths.js)
			//.pipe(minifyJS())
			.pipe( concat('master.js') )
			.pipe( gulp.dest( pathUtil.join(outPath, 'js/') ) );
	},
	images: function() {
		return gulp.src(paths.img)
			.pipe( imagemin( {optimizationLevel: 5} ) )
			.pipe( gulp.dest( pathUtil.join(outPath,'img/') ) );
	},
	styles: function() {
		return gulp.src(paths.css)
			.pipe( stylus() )
			.pipe( minifyCSS() )
			.pipe( gulp.dest( pathUtil.join(outPath+'css/') ) );
	},
	pages: function() {
		return gulp.src(paths.html)
			.pipe( jade( {data: {section: jadeIncludeSection}} ) )
			.pipe( minifyHTML() )
			.pipe( gulp.dest(outPath) );
	},
	static:  function() {
		return gulp.src(paths.static)
			.pipe( gulp.dest(outPath) );
	},
	dotfiles: function() {
		fs.mkdirSync( pathUtil.join(outPath) );
		fs.writeFileSync( pathUtil.join(outPath)+'.gitignore', '.DS_Store');
		fs.writeFileSync( pathUtil.join(outPath)+'.nojekyll', '');
	},
	clean: function(done) {
		rimraf( pathUtil.join(outPath), function(err) {
			if(err) return done(err);
			done();
		});
	}
}
gulp.task('scripts', compiler.scripts);
gulp.task('images', compiler.images);
gulp.task('styles', compiler.styles);
gulp.task('pages', compiler.pages);
gulp.task('static', compiler.static);


// Methods
gulp.task('watch', function() {
  gulp.watch(paths.js, ['scripts']);
  gulp.watch(paths.img, ['images']);
  gulp.watch(paths.css, ['styles']);
  gulp.watch(paths.html, ['pages']);
  gulp.watch(paths.static, ['static']);
});

gulp.task('server', function() {
	connect.createServer(
		connect.static( pathUtil.join(__dirname+"/"+outPath) )
	).listen(8000);
});


gulp.task('compile', function(done) {
	compiler.clean(function(err){
		compiler.dotfiles();
		compiler.scripts();
		compiler.images();
		compiler.styles();
		compiler.pages();
		compiler.static();
		done();
	});
});

gulp.task('pushRemote', ['compile'], function(done) {
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
			['push', '--quiet', '--force', deployRepo, "master"]
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

gulp.task('resetRemote', ['pushRemote'], function(done) {
	rimraf( pathUtil.join(outPath, ".git"), function(err) {
		if(err) return done(err);
		done();
	});
});

gulp.task('deploy', ['compile', 'pushRemote', 'resetRemote'], function(){
	console.log("Deployed to Github Pages!");
});

gulp.task('default', ['compile', 'watch', 'server']);