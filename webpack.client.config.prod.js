const path = require('path');
const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	entry: {
		app: [
			'./app/index.js',
		],
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist/app'),
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [
								[
									'env',
									{
										targets: {
											ie: 11,
										},
										modules: false,
										useBuiltIns: true,
									},
								],
								'react',
								'stage-0',
							],
						},
					},
				],
			},
			{
				test: /\.scss$/,
				use: ExtractTextPlugin.extract({
					use: [
						{
							loader: 'css-loader',
							options: {
								importLoaders: 1,
							},
						},
						{
							loader: 'sass-loader',
						},
					],
					fallback: 'style-loader',
				}),
			},
			{
				test: /.(jpg|jpeg|png|gif|woff(2)?|eot|otf|ttf|svg|pdf|csv)(\?[a-z0-9=\.]+)?$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							context: 'public',
						},
					},
				],
			},
		],
	},
	plugins: [
		new webpack.DefinePlugin({
			'process.env': {
				'NODE_ENV': JSON.stringify('production'),
			},
		}),
		new webpack.optimize.UglifyJsPlugin({
			output: {
				comments: false,
			},
		}),
		new ExtractTextPlugin('styles.css'),
		new webpack.NamedModulesPlugin(),
	],
	devtool: 'cheap-module-source-map',
};