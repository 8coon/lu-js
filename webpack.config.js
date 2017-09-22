
module.exports = {
    entry: './src/lou.js',
    output: {
        filename: 'dist/lou.js'
    },
    module: {
        loaders: [
            // JS
            {
                test: /.js?$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env']
                    }
                }
            }
        ]
    },
    devServer: {
        hot: true,
        inline: true,
        port: 3000,
        contentBase: [
            './',
            './test'
        ],
        open: true
    }
};
