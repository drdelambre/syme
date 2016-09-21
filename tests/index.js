const testsContext = require.context('./src/', true, /\.js$/),
    context = require.context('../src/', true, /\.(js|jsx)$/);

testsContext.keys().forEach(testsContext);
context.keys().forEach(context);
