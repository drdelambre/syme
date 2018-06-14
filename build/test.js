const helpers = require.context('./helpers/', true, /\.js$/);

helpers.keys().forEach(helpers);

const tests = require.context('../src/', true, /\.test.js$/);

tests.keys().forEach(tests);

const files = require.context('../src/', true, /(^(?!.+\.test\.js$).).+\.js$/);

files.keys().forEach((ctx) => {
    files(ctx);
});
