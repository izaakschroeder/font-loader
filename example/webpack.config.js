
var path = require('path'),
	webpack = require('webpack'),
	ExtractTextPlugin = require('extract-text-webpack-plugin');

// Export the webpack configuration
module.exports = {
	entry: {
		'test.css': './test.css',
		'test.scss.css': './test.scss'
		// 'test.js': './test.js'
	},

	// Output controls the settings for file generation.
	output: {
		filename: '[name].[hash].js',
		path: path.join(__dirname, 'build'),
		chunkFilename: '[id].[hash].js'
	},

	// Module settings.
	module: {
		loaders: [{
			test: /\.css$/,
			loaders: [
				ExtractTextPlugin.loader({
					extract: true,
					omit: 1
				}),
				'style',
				'css?importLoaders=1',
				'font?format[]=truetype&format[]=woff&format[]=embedded-opentype'
			]
		}, {
			test: /\.scss$/,
			loaders: [
				ExtractTextPlugin.loader({
					extract: true,
					omit: 1
				}),
				'style',
				'css?importLoaders=1',
				'font?format[]=truetype&format[]=woff&format[]=embedded-opentype',
				'sass'
			]
		}]
	},

	plugins: [
		new ExtractTextPlugin('[name].[hash].css')
	]
};
