
var _ = require('lodash'),
	fs = require('fs'),
	loaderUtils = require('loader-utils'),
	ttf2eot = require('ttf2eot'),
	ttf2woff = require('ttf2woff');



function interpolateName(ex, content) {
	return loaderUtils.interpolateName(self, query.name || "[hash]." + ex, {
		context: query.context || self.options.context,
		content: content,
		regExp: query.regExp
	});
}

function output(item, ext) {
	var name = interpolateName(ext, item);
	self.emitFile(name, item);
	return name;
}



function transform(input, output, done) {

}

module.exports = function(source) {
	this.cacheable();

	var self = this;

	console.log(this);

	var meta = JSON.parse(source),
		query = loaderUtils.parseQuery(this.query),
		base = this.context,
		callback = this.async();

	//var ttf = new Buffer(source)
	//	eot = ttf2eot(ttf, { }).buffer,
	//	woff = ttf2woff(ttf, { }).buffer;

	callback();
}
