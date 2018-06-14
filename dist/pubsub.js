'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.pub = pub;
exports.sub = sub;
exports.unsub = unsub;
exports.clear = clear;
exports.channels = channels;

var _setImmediate = require('./internal/setImmediate.js');

var _setImmediate2 = _interopRequireDefault(_setImmediate);

var _generateTopic = require('./internal/generateTopic.js');

var _generateTopic2 = _interopRequireDefault(_generateTopic);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var cache = {};

function cleanPathArgs(path, descriptor, args) {
    var pathArgs = descriptor.regexp.exec(path).slice(1);
    var ni = void 0,
        no = void 0;

    for (ni = 0; ni < pathArgs.length; ni++) {
        no = parseFloat(pathArgs[ni]);

        /* istanbul ignore if */
        if (!isNaN(no)) {
            pathArgs[ni] = no;
        }
    }

    return pathArgs.concat(args);
}

function createAsyncPub(fun, params) {
    (0, _setImmediate2.default)(function () {
        fun.apply(fun, params);
    });
}

function pub(topic) {
    var ni = void 0,
        t = void 0,
        pathArgs = void 0;

    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
    }

    for (t in cache) {
        if (!cache[t].regexp.test(topic)) {
            continue;
        }

        pathArgs = cleanPathArgs(topic, cache[t], args);

        for (ni = 0; ni < cache[t].subs.length; ni++) {
            createAsyncPub(cache[t].subs[ni], pathArgs);
        }
    }
}

function sub(topic, callback) {
    var _topic = (0, _generateTopic2.default)(topic);

    if (typeof callback !== 'function') {
        return;
    }

    if (!cache.hasOwnProperty(_topic.path)) {
        cache[_topic.path] = _topic;
    }

    cache[_topic.path].subs.push(callback);

    return [_topic.path, callback];
}

function unsub(topic, callback) {
    var _topic = (0, _generateTopic2.default)(topic);
    var ni = void 0;

    if (!cache.hasOwnProperty(_topic.path)) {
        return;
    }

    for (ni = 0; ni < cache[_topic.path].subs.length; ni++) {
        if (cache[_topic.path].subs[ni] === callback) {
            cache[_topic.path].subs.splice(ni, 1);
        }
    }
}

function clear() {
    cache = {};
}

function channels() {
    var out = [];
    var ni = void 0;

    for (ni in cache) {
        out.push(cache[ni].topic);
    }

    /*eslint-disable */
    console.log('Subscribed Channels:\n\t' + out.sort().join('\n\t'));
    /*eslint-enable */
}