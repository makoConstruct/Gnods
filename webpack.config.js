module.exports = {
	entry: './foolin.ts',
	output: {
		filename: 'mainpage.js'
	},
	resolve: {
		extensions: ['', '.webpack.js', '.web.js', '.ts', '.js']
	},
	module: {
		loaders: [
			{ test: /\.ts$/, loader: 'ts-loader' }
		]
	},
	ts: {
		visualStudioErrorFormat:true
	}
}