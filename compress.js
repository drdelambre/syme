var fs = require('fs'),
    minify = require('uglify-js').minify;

function getFiles(path) {
    fs.readdirSync(path)
        .forEach(function(_path) {
            var fullPath = path + '/' + _path,
                stat = fs.statSync(fullPath);

            if (stat.isDirectory()) {
                getFiles(fullPath);
                return;
            }

            var result = minify(fs.readFileSync(fullPath, 'utf-8'));

            fs.writeFileSync(fullPath, result.code);
        });
}

getFiles('./dist');
