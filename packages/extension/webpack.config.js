const path = require('path');

module.exports = [{
    target: "node",
    entry: {
        extension: './src/extension.ts',
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
        vscode: "vscode"
    },    
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",        
    }
}, {
    entry: {
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
        vscode: "vscode"
    },    
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        libraryTarget: "commonjs2",
        devtoolModuleFilenameTemplate: "../[resource-path]",        
    }
}];


