const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
	entry: {
		app: [
			'webpack-dev-server/client?http://localhost:4001',
			'./app/index.js',
		],
	},
	output: {
		filename: '[name].js',
		publicPath: 'http://localhost:4001/dist'
	},
	module: {
		rules: [
			{
				test: /\.jsx?$/,
				exclude: /node_modules|workspace\/opentok-react/,
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
					},
				],
			},
		],
	},
	plugins: [
		new ExtractTextPlugin('styles.css'),
		new webpack.NamedModulesPlugin(),
	],
	devtool: 'inline-source-map',
	devServer: {
		host: 'localhost',
		port: 4001,
		headers: {
			'Access-Control-Allow-Origin': 'http://localhost:4000',
			'Access-Control-Allow-Credentials': true
		},
		proxy: {
			"/assets": "http://localhost:4001/public",
		},
	},
};
