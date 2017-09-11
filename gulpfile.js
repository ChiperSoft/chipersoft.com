var through = require('through2');

var path = require('path');
var fs = require('fs');
var moment = require('moment');
var RSS = require('rss');

var gulp = require('gulp');
var less = require('gulp-less');

var minifyCSS = require('gulp-minify-css');
var frontmatter = require('gulp-front-matter');
var clean = require('gulp-clean');
var gutil = require('gulp-util');

var handlebars = require('handlebars');
require('helper-hoard').load(handlebars);

var hljs   = require('highlight.js');
var md     = require('markdown-it')({
	html: true,
	linkify: true,
	typographer: true,
	highlight: function highlight (str, lang) {
		if (lang && hljs.getLanguage(lang)) {
			try {
				return hljs.highlight(lang, str).value;
			} catch (__) {}
		}

		return ''; // use external default escaping
	}
}).use(require('markdown-it-anchor'))


function markdown () {
	return through.obj(function (file, enc, next) {
		var contents = md.render(file.contents.toString('utf8'));

		var basename = path.basename(file.relative, path.extname(file.relative));

		file.contents = new Buffer(contents);
		file.path = file.base + basename + '.html';
		this.push(file);
		next();
	})
}

function postMetadata () {
	return through.obj(function (file, enc, next) {
		var basename = path.basename(file.relative, path.extname(file.relative));
		var dateglob = basename.match(/(\d{4}-\d{2}-\d{2})-/);
		var date = moment(dateglob[1]);
		basename = basename.replace(dateglob[0], '');

		file.meta.date = date;
		file.meta.url = '/p/'+basename;
		file.meta.original = path.relative(file.cwd, file.path);

		file.path = file.base + 'p/' + basename + '/index.html';

		this.push(file);
		next();
	});
}

function postContent () {
	var pageTemplate = handlebars.compile(String(fs.readFileSync(__dirname + '/templates/post.hbs.html')));
	var postIndex;
	try {
		postIndex = require('./posts.json');
	} catch (e) {
		postIndex = false;
	}

	return through.obj(function (file, enc, next) {
		var data = Object.assign({}, {
			page: {
				title: file.meta.title + ' :: Jarvis Badgley'
			},
			posts: postIndex,
			contents: String(file.contents)
		}, file.meta);


		var html = String(pageTemplate(data));

		file.contents = new Buffer(html);
		this.push(file);
		next();
	});
}

function renderPage () {
	var postIndex;
	try {
		postIndex = require('./posts.json');
	} catch (e) {
		postIndex = false;
	}

	return through.obj(function (file, enc, next) {
		var template = handlebars.compile(String(file.contents));

		var data = Object.assign({}, {
			page: {title: file.meta.title ? file.meta.title + ' :: Jarvis Badgley' : 'ChiperSoft, Jarvis Badgley'},
			posts: postIndex
		}, file.meta);

		var html = template(data);

		html = String(html);

		file.contents = new Buffer(html);
		this.push(file);
		next();
	});
}

function postAliases () {
	var aliasTemplate = handlebars.compile(String(fs.readFileSync(__dirname + '/templates/redirect.hbs.html')));

	return through.obj(function (file, enc, next) {
		if (!file.meta.alias) {
			return next();
		}

		var html = aliasTemplate({
			page: file.meta
		});
		
		var i = file.meta.alias.length;
		while (i-- > 0) {
			alias = new gutil.File(file);
			alias.path = file.base + file.meta.alias[i] + '/index.html';
			alias.contents = new Buffer(html);
			this.push(alias);
		}
		next();
	});
}

function buildPostIndex () {
	var posts = [];
	var base = false;
	return through.obj(function transform (file, enc, next) {
		if (!base) {
			base = new gutil.File(file);
		}

		if (!file.meta.draft) {
			posts.unshift(Object.assign({}, file.meta, {contents: String(file.contents)}));
		}
		next();
	}, function flush (next) {
		base.path = base.base + 'posts.json';
		base.contents = new Buffer(JSON.stringify(posts, null, '  '));
		this.push(base);
		next();
	});
}

var debug = through.obj(function (file, end, next) {
	console.log(Object.assign({}, file, {relative: file.relative}));
	this.push(file);
	next();
});

gulp.task('clean', function() {
	return gulp.src('docs', {read: false})
		.pipe(clean());
});

gulp.task('hbs-partials', function () {
	handlebars.registerPartial('layout', handlebars.compile(String(fs.readFileSync(__dirname + '/templates/layout.hbs.html'))));
});

gulp.task('index-posts', function () {
	
	return gulp.src('./posts/**/*.md')
		.pipe(frontmatter({
			property: 'meta'
		}))
		.pipe(markdown())
		.pipe(postMetadata())
		.pipe(buildPostIndex())
		.pipe(gulp.dest('.'));
});

gulp.task('rss', ['index-posts'], function (cb) {
	var postIndex = require('./posts.json');

	var feed = new RSS({
		title: 'ChiperSoft: Jarvis Badgley',
		feed_url: 'http://chipersoft.com/atom.xml',
		site_url: 'http://chipersoft.com',
		image_url: 'http://chipersoft.com/images/dexter.png',
		// author: 'Jarvis Badgley'
	});

	postIndex.forEach(function (post) {
		feed.item({
			title: post.title,
			date: post.date,
			description: post.content,
			url: 'http://chipersoft.com'+post.url
		});
	});

	fs.writeFile(__dirname + '/docs/atom.xml', feed.xml(), cb);
});

gulp.task('pages', ['pages-hbs', 'pages-md']);

gulp.task('pages-hbs', ['index-posts', 'hbs-partials'], function () {
	return gulp.src(['./pages/*', '!./pages/*.md'])
		.pipe(frontmatter({
			property: 'meta'
		}))
		.pipe(renderPage())
		.pipe(gulp.dest('docs'));
});

gulp.task('pages-md', ['index-posts', 'hbs-partials'], function () {
	return gulp.src('./pages/*.md')
		.pipe(frontmatter({
			property: 'meta'
		}))
		.pipe(markdown())
		.pipe(through.obj(function (file, enc, next) {
			var contents = '{{#extend "layout"}}{{#content "article"}}';
			contents += '<article><div class="page-header"><h1 class="post-title">{{title}}</h1></div><div class="post-content">';
			contents += file.contents;
			contents += '</div></article>{{/content}}{{/extend}}';
			file.contents = new Buffer(contents);
			this.push(file);
			next();
		}))
		.pipe(renderPage())
		.pipe(gulp.dest('docs'));
});

gulp.task('posts', ['index-posts', 'hbs-partials'], function () {
	return gulp.src('./posts/**/*.md')
		.pipe(frontmatter({
			property: 'meta'
		}))
		.pipe(markdown())
		.pipe(postMetadata())
		.pipe(postContent())
		.pipe(gulp.dest('docs'));
});

gulp.task('aliases', function () {
	return gulp.src('./posts/**/*.md')
		.pipe(frontmatter({
			property: 'meta'
		}))
		.pipe(postMetadata())
		.pipe(postAliases())
		.pipe(gulp.dest('docs'));
});



gulp.task('files', function () {
	gulp.src('./files/**/*')
		.pipe(gulp.dest('docs'));
});

gulp.task('less', function () {
	gulp.src('./less/main.less')
		.pipe(less())
		.pipe(minifyCSS())
		.pipe(gulp.dest('docs/css'));
});



gulp.task('watch', function() {
	gulp.watch('./less/**/*.less', ['less']);
	gulp.watch('./pages/**/*', ['pages']);
	gulp.watch('./posts/**/*.md', ['posts', 'pages']);
	gulp.watch('./templates/**/*.html', ['pages', 'posts']);
	gulp.watch('./files/**/*', ['files']);

	var forever = require('forever');
	var srv = new forever.Monitor('server.js');
	srv.start();
	forever.startServer(srv);

});

gulp.task('docs', ['less', 'index-posts', 'rss', 'pages', 'posts', 'aliases', 'files']);

gulp.task('default', ['clean'], function (cb) {
	gulp.start('docs', function () {cb();});
});
