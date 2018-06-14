'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
function testForLocalStorage() {
    /* istanbul ignore if: not testing server yet */
    if (typeof window === 'undefined' || !window.document) {
        return false;
    }

    var uid = '' + Date.now();

    try {
        window.localStorage.setItem(uid, uid);

        var works = window.localStorage.getItem(uid) === uid;

        window.localStorage.removeItem(uid);

        return works;
    } catch (exception) {
        /* istanbul ignore next: client is speced correctly */
        return false;
    }
}

function testForSessionStorage() {
    /* istanbul ignore if: not testing server yet */
    if (typeof window === 'undefined' || !window.document) {
        return false;
    }

    var uid = '' + Date.now();

    try {
        window.sessionStorage.setItem(uid, uid);

        var works = window.sessionStorage.getItem(uid) === uid;

        window.sessionStorage.removeItem(uid);

        return works;
    } catch (exception) {
        /* istanbul ignore next: client is speced correctly */
        return false;
    }
}

function generateMemoryStore() {
    var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'memory';

    /* istanbul ignore next: not testing server yet */
    if (typeof window === 'undefined' || !window.document) {
        var getNamespace = require('continuation-local-storage').getNamespace;

        return {
            get: function get(key) {
                var namespace = getNamespace('ServerState');

                if (!namespace.get) {
                    throw new Error(['', 'Server misconfigured:', '\tPlease make sure to create the namespace before', '\tusing the cache system on the server.', '\thttps://github.com/drdelambre/syme#cache-serverside', ''].join('\n'));
                }

                return (namespace.get(channel) || {})[key];
            },
            set: function set(key, val) {
                var namespace = getNamespace('ServerState');

                if (!namespace.get) {
                    throw new Error(['', 'Server misconfigured:', '\tPlease make sure to create the namespace before', '\tusing the cache system on the server.', '\thttps://github.com/drdelambre/syme#cache-serverside', ''].join('\n'));
                }

                var oldData = namespace.get(channel) || {};

                oldData[key] = val;

                return namespace.set(channel, oldData);
            },
            clear: function clear() {}
        };
    }

    var state = {};

    return {
        get: function get(key) {
            return state[key];
        },
        set: function set(key, val) {
            state[key] = val;
        },
        clear: function clear() {
            var ni = void 0;

            for (ni in state) {
                delete state[ni];
            }
        }
    };
}

/* istanbul ignore next */
function generateSessionStore() {
    var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'session';

    /* istanbul ignore if: this always returns true on phantom */
    if (!testForSessionStorage()) {
        /* istanbul ignore next: we can assume this is safe? */
        return generateMemoryStore(channel);
    }

    return {
        get: function get(key) {
            var val = window.sessionStorage.getItem(key);

            if (val) {
                return JSON.parse(val);
            }

            return null;
        },
        set: function set(key, val) {
            window.sessionStorage.setItem(key, JSON.stringify(val));
        },
        clear: function clear() {
            window.sessionStorage.clear();
        }
    };
}

/* istanbul ignore next */
function generateLocalStore() {
    var channel = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'local';

    /* istanbul ignore if: this always returns true on phantom */
    if (!testForLocalStorage()) {
        /* istanbul ignore next: we can assume this is safe? */
        return generateSessionStore(channel);
    }

    return {
        get: function get(key) {
            var val = window.localStorage.getItem(key);

            if (val) {
                return JSON.parse(val);
            }

            return null;
        },
        set: function set(key, val) {
            window.localStorage.setItem(key, JSON.stringify(val));
        },
        clear: function clear() {
            window.localStorage.clear();
        }
    };
}

var storage = {
    memory: generateMemoryStore(),
    local: generateLocalStore(),
    session: generateSessionStore()
};

exports.testForLocalStorage = testForLocalStorage;
exports.testForSessionStorage = testForSessionStorage;
exports.default = storage;