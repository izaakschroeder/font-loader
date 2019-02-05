
var _ = require('lodash'),
	Promise = require('bluebird'),
	path = require('path'),
	fs = require('fs'),
	loaderUtils = require('loader-utils'),
	multiplex = require('option-multiplexer'),
	ttf2eot = require('ttf2eot'),
	ttf2woff = require('ttf2woff'),
	svg2ttf = require('svg2ttf');

var template = _.template(fs.readFileSync(path.join(
	__dirname, '..', 'share', 'font.template'
)));

var extensions = {
	'.woff': 'woff',
	'.ttf': 'truetype',
	'.eot': 'embedded-opentype',
	'.svg': 'svg',
	'.otf': 'opentype'
};

var convertors = {
	'svg': {
		'truetype': function(font, data) {
			return svg2ttf(data, { }).buffer;
		}
	},
	'truetype': {
		'woff': function(font, data) {
			return ttf2woff(data, { }).buffer;
		},
		'embedded-opentype': function(font, data) {
			return ttf2eot(data, { }).buffer;
		},
		'opentype': function(font, data) {
			return data;
		}
	},
	'opentype': {
		'woff': function(font, data) {
			return ttf2woff(data, { }).buffer;
		},
		'embedded-opentype': function(font, data) {
			return ttf2eot(data, { }).buffer;
		},
		'truetype': function(font, data) {
			return data;
		}
	}
};

var formats = _.invert(extensions);

function getDefaultFormat(ext) {
	return extensions[ext];
}

function getExtension(format) {
	return formats[format];
}

function createTargets(source, options) {
	options = _.defaults(_.pick(options, 'weight', 'style', 'format'), {
		weight: _.chain(source).map('weight').uniq().value(),
		style: _.chain(source).map('style').uniq().value(),
		format: _.chain(source).map('format').uniq().value()
	});
	return multiplex(options);
}

function groupFaces(meta, fonts) {
	return _.chain(fonts)
		.groupBy(function(font) {
			return JSON.stringify(_.pick(font, 'weight', 'style'))
		}).map(function(members, key) {
			var props = JSON.parse(key);
			return _.assign(props, {
				name: meta.name,
				files: members
			});
		})
		.value();
}

module.exports = function(input) {


	var _this = this,
		globalQuery = loaderUtils.parseQuery(this.query),
		localQuery = loaderUtils.parseQuery(this.resourceQuery),
		query = _.assign({ }, globalQuery, localQuery),
		base = this.context,
		callback = this.async();

	// Since queries are strings, need to turn weights to ints to get them
	// matched properly
	if (query.weight) {
		if (!_.isArray(query.weight)) {
			query.weight = [ query.weight ];
		}
		query.weight = _.map(query.weight, function(value) {
			return parseInt(value, 10);
		});
	}

	if (query.style) {
		if (!_.isArray(query.style)) {
			query.style = [ query.style ];
		}
	}

	function interpolateName(font) {
		var name = [
			_.kebabCase(meta.name),
			font.style,
			font.weight
		].join('-') + '.[hash:8]' + getExtension(font.format);

		// TODO: Should this be globalQuery or localQuery?
		return loaderUtils.interpolateName(_this, name, {
			context: globalQuery.context || _this.options.context,
			content: font.data,
			regExp: globalQuery.regExp
		});
	}

	function emit(font) {
		var name = interpolateName(font);
		_this.emitFile(name, font.data);
		return name;
	}

	this.cacheable();

	// WOW THIS IS HACKY
	if (/\.(css|sass|scss)$/.test(this.resourcePath)) {
		callback(null, input);
		return;
	}

	var meta = JSON.parse(input);
	var targets, results;

	function defaults(file) {
		_.defaults(file, {
			weight: 500,
			format: getDefaultFormat(path.extname(file.file)),
			style: 'regular',
			data: new Promise(function filePromise(resolve, reject) {
				fs.readFile(path.join(base, file.file), function fileLoaded(err, data) {
					_this.dependency(file.file);
					return err ? reject(err) : resolve(data);
				});
			})
		});
	}

	_.forEach(meta.files, defaults);
	targets = createTargets(meta.files, query);

	results = _.map(targets, function processTarget(target) {
		var search = _.pick(target, 'weight', 'style'),
			source = _.find(meta.files, search);

		if (!source) {
			return Promise.reject('No matching source to ' + query + '.');
		}
		return source.data.then(function dataLoaded(data) {
			return _.assign({
				data: source.format === target.format ?
					data :
					convertors[source.format][target.format](target, data)
			}, target);
		}).then(function emitFont(font) {
			font.file = emit(font);
			return font;
		});
	});

	Promise.all(results).then(function fontsGenerated(fonts) {
		var faces = groupFaces(meta, fonts);
		callback(null, template({
			faces: faces,
			publicPath: _this.options.output.publicPath
		}));
	}).catch(function errored(err) {
		callback(err);
	});
};
