const argv = require('yargs').argv,
    webpack = require('webpack'),
    webpackConfig = require('./webpack.config'),
    TEST_BUNDLER = './build/test.js';

webpackConfig.module.rules.push({
    test: /\.(js|jsx)$/,
    use: {
        loader: 'istanbul-instrumenter-loader',
        options: {
            esModules: true
        }
    },
    enforce: 'post',
    exclude: /node_modules|\.test\.js$/
});

webpackConfig.plugins.push(
    new webpack.ProvidePlugin({
        'React': 'react'
    })
);

webpackConfig.plugins.push(
    new webpack.IgnorePlugin(/^(continuation-local-storage)$/)
);

const karmaConfig = {
    basePath: '../',
    browsers: [ 'ChromeHeadless' ],
    singleRun: !argv.watch,
    files: [ {
        pattern: TEST_BUNDLER,
        watched: false,
        served: true,
        included: true
    } ],
    frameworks: [ 'mocha', 'chai', 'snapshot', 'mocha-snapshot', 'sinon' ],
    reporters: [ 'progress', 'coverage-istanbul' ],
    preprocessors: {
        '**/__snapshots__/**/*.md': [ 'snapshot' ],
        [TEST_BUNDLER]: [ 'webpack' ]
    },
    logLevel: 'WARN',
    browserConsoleLogOptions: {
        terminal: true,
        format: '%b %T: %m',
        level: ''
    },
    webpack: {
        entry: TEST_BUNDLER,
        devtool: 'cheap-module-source-map',
        module: webpackConfig.module,
        plugins: webpackConfig.plugins,
        resolve: webpackConfig.resolve,
        externals: {
            'react/addons': 'react',
            'react/lib/ExecutionEnvironment': 'react',
            'react/lib/ReactContext': 'react'
        },
        node: {
            fs: 'empty'
        }
    },
    webpackMiddleware: {
        stats: 'errors-only',
        noInfo: true
    },
    coverageIstanbulReporter: {
        reports: [ 'html', 'text-summary' ],
        fixWebpackSourcePaths: true
    },
    snapshot: {
        update: !!process.env.UPDATE,
        prune: !!process.env.PRUNE
    }
};

module.exports = (cfg) => cfg.set(karmaConfig);
