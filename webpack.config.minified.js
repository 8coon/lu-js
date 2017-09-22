const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
    entry: './src/lou.js',
    output: {
        filename: 'dist/lou.min.js'
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
    plugins: [
        new UglifyJSPlugin({
            uglifyOptions: {
                mangle: {
                    except: ['Lou']
                }
            }
        })
    ]
};
