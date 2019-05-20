const path = require('path');

module.exports = {
    entry: [
        './src/l.js',
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'l.js',
        libraryTarget: 'umd',
        globalObject: 'this',
        library: 'l',        
    },
    module: {
        rules: [
            {
                loader: 'babel-loader',
                test: /\.js$/,
                include: [path.resolve(__dirname, 'src')],
                exclude: /node_modules/,
                query: {
                    presets: ['@babel/env']
                }
            }
        ]
    }
};
