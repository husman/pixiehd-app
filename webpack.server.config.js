const path = require('path');
const nodeExternals = require('webpack-node-externals');


module.exports = {
	entry: {
		index: './server/index.js',
	},
	output: {
		filename: '[name].js',
		path: path.resolve(__dirname, 'dist/server'),
	},
	target: 'node',
	externals: [
		nodeExternals(),
	],
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
											node: 'current',
										},
										useBuiltIns: true,
										modules: false,
									},
								],
								'react',
								'stage-0',
							],
						},
					},
				],
			},
		],
	},
	resolve: {
		extensions: ['.js'],
	},
};