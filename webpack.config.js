
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
        hot: false,
        inline: false,
        port: 3000,
        contentBase: [
            './',
            './test'
        ]
    }
};
