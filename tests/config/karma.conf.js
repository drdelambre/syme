var ExtractTextPlugin = require("extract-text-webpack-plugin"),
    path = require('path');

module.exports = function(config) {
    config.set({
        basePath: '',
        files: [
            '../../node_modules/babel-polyfill/dist/polyfill.js',
            '../index.js'
        ],

        preprocessors: {
            '../index.js': [ 'webpack', 'sourcemap' ]
        },

        frameworks: [ 'phantomjs-shim', 'mocha', 'chai', 'sinon' ],

        webpack: {
            resolve: {
                extensions: [ '', '.js', '.less', '.jsx' ],
                alias: {
                    'sinon': 'sinon/pkg/sinon',
                    'base': path.resolve(__dirname, '../../src')
                }
            },
            isparta: {
                embedSource: true,
                noAutoWrap: true,
                babel: {
                    compact: false,
                    presets: [['es2015', { module: false }], 'react', 'stage-0']
                }
            },
            externals: {
                'jsdom': 'window',
                'cheerio': 'window',
                'react/lib/ExecutionEnvironment': true,
                'react/lib/ReactContext': 'window',
                'text-encoding': 'window'
            },
            devtool: 'inline-source-map',
            node: {
                fs: 'empty'
            },
            module: {
                noParse: [
                    /node_modules\/sinon\//,
                ],
                loaders: [ {
                    test: /\.(js|jsx)$/,
                    exclude: ['node_modules/**/*'],
                    loader: 'babel-loader',
                    query: {
                        compact: false,
                        presets: [['es2015', { module: false }], 'react', 'stage-0']
                    }
                }, {
                    test: /\.(js|jsx)$/,
                    loader: 'isparta',
                    exclude: /(shims|tests|node_modules)\//
                }, {
                    test: /\.less$/,
                    loader: "style-loader!css-loader!less-loader?{\"globalVars\":{\"theme\":\"teal\"},\"sourceMap\":true}"
                }, {
                    test: /\.(jpe?g|png|gif|svg)$/i,
                    loaders: [
                        'file?name=/static/img/' + config.project + '/[hash:8].[ext]',
                        'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false'
                    ]
                } ]
            }
        },

        webpackMiddleware: {
            noInfo: true
        },

        coverageReporter: {
            type: 'html',
            dir: '../coverage/',

            check: {
                each: {
                    statements: 96,
                    branches: 95,
                    functions: 96,
                    lines: 96
                }
            }
        },

        reporters: [ 'dots', 'coverage' ],
        port: 9876,
        colors: true,
        logLevel: config.LOG_ERROR,
        autoWatch: true,
        browsers: [ 'PhantomJS' ],
        singleRun: true
    });
};