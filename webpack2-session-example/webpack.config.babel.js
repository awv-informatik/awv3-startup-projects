import path from "path";
import webpack from "webpack";

module.exports = env => {
    return {
        //entry: __dirname + "/index.js",
		entry: ['babel-polyfill', 'whatwg-fetch', __dirname + "/index.js"],
        output: {
            filename: "bundle.js",
            path: __dirname,
        },
        module: {
            loaders: [
                { test: /\.js$/, loader: "babel-loader", exclude: /node_modules/ },
                { test: /\.glsl$/, loader: "webpack-glsl-loader" }
            ]
        },
        plugins: [
            new webpack.LoaderOptionsPlugin({
                options: { worker: { output: { filename: "bundle.worker.js" } } } })
        ],
        resolve: {
            modules: [path.resolve("./"), "node_modules"],
            extensions: [".js"],
            alias: { three: "three/src/Three.js" }
        },
        devServer: {
            contentBase: __dirname,
            stats: 'errors-only'
        },
        devtool: 'source-map',
        performance: { hints: false }
    }
}
