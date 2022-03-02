const path = require('path');

module.exports = {
    entry: {
        extension: './src/extension.ts',
        webview: './src/webview.ts',
    },
    devtool: 'source-map',
    mode: 'development',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },],
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: {
            "buffer": require.resolve("buffer/"),
            "path": require.resolve("path-browserify")            
        }        
    },
    externals: {
        vscode: "vscode" // the vscode-module is created on-the-fly and must be excluded. Add other modules that cannot be webpack'ed, 📖 -> https://webpack.js.org/configuration/externals/
    },    
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true,
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",        
    }
};