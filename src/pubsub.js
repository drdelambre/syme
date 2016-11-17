import setImmediate from 'internal/setImmediate.js';
import generateTopic from 'internal/generateTopic.js';

let cache = {};

function cleanPathArgs(path, descriptor, args) {
    const pathArgs = descriptor.regexp.exec(path).slice(1);
    let ni, no;

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
    setImmediate(function() {
        fun.apply(fun, params);
    });
}

export function pub(topic, ...args) {
    let ni, t, pathArgs;

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

export function sub(topic, callback) {
    const _topic = generateTopic(topic);

    if (typeof callback !== 'function') {
        return;
    }

    if (!cache.hasOwnProperty(_topic.path)) {
        cache[_topic.path] = _topic;
    }

    cache[_topic.path].subs.push(callback);

    return [ _topic.path, callback ];
}

export function unsub(topic, callback) {
    const _topic = generateTopic(topic);
    let ni;

    if (!cache.hasOwnProperty(_topic.path)) {
        return;
    }

    for (ni = 0; ni < cache[_topic.path].subs.length; ni++) {
        if (cache[_topic.path].subs[ni] === callback) {
            cache[_topic.path].subs.splice(ni, 1);
        }
    }
}

export function clear() {
    cache = {};
}

export function channels() {
    const out = [];
    let ni;

    for (ni in cache) {
        out.push(cache[ni].topic);
    }

    /*eslint-disable */
    console.log('Subscribed Channels:\n\t' + out.sort().join('\n\t'));
    /*eslint-enable */
}
