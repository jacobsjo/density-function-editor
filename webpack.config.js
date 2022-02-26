const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin')


module.exports = {
    entry: {
        bundle: './src/main/app.ts',
    },
    devtool: 'inline-source-map',
    mode: 'development',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/,
        },],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
        fallback: { "buffer": require.resolve("buffer/") }        
    },
    plugins: [
        new CopyWebpackPlugin({
            patterns: [
                { from: 'public', to: '' }
            ]
        }),
    ],
    output: {
        filename: '[name].js',
        path: path.resolve(__dirname, 'dist'),
        clean: true
    }
};