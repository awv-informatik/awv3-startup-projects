import path from "path";
import webpack from "webpack";

module.exports = env => {
    return {
        entry: __dirname + "/index.js",
        output: {
            filename: "build/bundle.js",
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
                options: { worker: { output: { filename: "build/worker.js" } } } })
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
        devtool: undefined,
        performance: { hints: false }
    }
}
