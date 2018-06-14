const path = require('path');
const webpack = require('webpack');
const project = require('../project.config');

const inProject = path.resolve.bind(path, project.basePath);
const inProjectSrc = (file) => inProject(project.srcDir, file);

const __DEV__ = project.env === 'development';
const __TEST__ = project.env === 'test';
const __PROD__ = project.env === 'production';

const config = {
    entry: {
        normalize: [
            inProjectSrc('normalize')
        ],
        main: [
            inProjectSrc(project.main)
        ]
    },
    devtool: project.sourcemaps ? 'source-map' : false,
    output: {
        path: inProject(project.outDir),
        filename: __DEV__ ? '[name].js' : '[name].[chunkhash].js',
        publicPath: project.publicPath
    },
    resolve: {
        modules: [
            inProject(project.srcDir),
            'node_modules'
        ],
        extensions: [ '*', '.js', '.jsx', '.json' ]
    },
    externals: project.externals,
    module: {
        rules: [],
        noParse: /(mapbox-gl)\.js$/
    },
    plugins: [
        new webpack.DefinePlugin(Object.assign({
            'process.env': { NODE_ENV: JSON.stringify(project.env) },
            __DEV__,
            __TEST__,
            __PROD__
        }, project.globals))
    ]
};

// JavaScript
// ------------------------------------
config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: [ {
        loader: 'babel-loader',
        query: {
            cacheDirectory: true,
            plugins: [
                [
                    'module-resolver', {
                        alias: {
                            base: './src/',
                            internal: './src/internal'
                        }
                    }
                ],
                'babel-plugin-transform-class-properties',
                'babel-plugin-syntax-dynamic-import',
                [
                    'babel-plugin-transform-runtime',
                    {
                        helpers: true,
                        polyfill: false, // we polyfill needed features in src/normalize.js
                        regenerator: true
                    }
                ],
                [
                    'babel-plugin-transform-object-rest-spread',
                    {
                        useBuiltIns: true // we polyfill Object.assign in src/normalize.js
                    }
                ]
            ],
            presets: [
                'babel-preset-react',
                [ 'babel-preset-env', {
                    modules: false,
                    targets: {
                        ie9: true
                    },
                    uglify: true
                } ]
            ]
        }
    } ]
});

// Bundle Splitting
// ------------------------------------
if (!__TEST__) {
    const bundles = [ 'normalize', 'manifest' ];

    if (project.vendors && project.vendors.length) {
        bundles.unshift('vendor');
        config.entry.vendor = project.vendors;
    }
    config.plugins.push(new webpack.optimize.CommonsChunkPlugin({ names: bundles }));
}

module.exports = config;
