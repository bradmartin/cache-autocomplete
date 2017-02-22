var webpack = require('webpack');

var config = {
    entry: __dirname + '/src/cacheautocomplete.js',
    devtool: 'source-map',
    output: {
        path: __dirname + '/dist',
        filename: 'cacheautocomplete.js',
        library: 'cacheautocomplete',
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
};

module.exports = config;
