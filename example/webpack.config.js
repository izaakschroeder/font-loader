
var path = require('path'),
	webpack = require('webpack'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');

// Export the webpack configuration
module.exports = {
	entry: {
		// 'test.css': './test.css',
		'test.js': './test.js'
	},

	// Output controls the settings for file generation.
	output: {
		filename: '[name].[hash].[ext]',
		path: path.join(__dirname, 'build'),
		chunkFilename: '[id].[hash].[ext]'
	},

	// Module settings.
	module: {
		loaders: [{
			test: /\.font\.json$/,
			loader: 'font?format=ttf,woff,eot'
		}, {
			test: /\.scss$/,
			loaders: [
				'raw',
				'css',
				'sass?precision=10&outputStyle=expanded&sourceMap=true'
			]
		}]
	},

	plugins: [
		new ExtractTextPlugin('[name].[hash].css')
	]
};
