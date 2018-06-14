'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.StorageController = undefined;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _storage = require('./storage');

var _storage2 = _interopRequireDefault(_storage);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function normalizeChannel(channel, func) {
    if (!/^(memory|local|session)$/.test(channel)) {
        throw new Error('Invalid storage mechanism sent to StorageController.' + func);
    }

    /* istanbul ignore if: we aren't testing on the server yet */
    if (typeof window === 'undefined') {
        return 'memory';
    }

    return channel;
}

/**\

    title: StorageController
    category: service
    description:
        This singleton handles building a snapshot of generated state
        on the server, and handles pushing that state around the client.
        It only works with basic objects.
    todos:
        There still needs to be a mechanism for the initial data to refresh
        the data of the client if localStorage gets stale or something.

\**/

var StorageController = function () {
    function StorageController() {
        var _this = this;

        (0, _classCallCheck3.default)(this, StorageController);

        if (typeof window === 'undefined' || !window.StorageController) {
            return;
        }

        try {
            var initial = JSON.parse(window.atob(window.StorageController));

            if (Object.prototype.toString.call(initial) !== '[object Object]') {
                throw new Error('invalid type');
            }

            setTimeout(this._pruneCache.bind(this, function () {
                var memory = initial.memory || {},
                    local = initial.local || {},
                    session = initial.session || {};
                var ni = void 0;

                for (ni in memory) {
                    _this.populate('memory', ni, 0, memory[ni], true);
                }

                for (ni in local) {
                    _this.populate('local', ni, 0, local[ni], true);
                }

                for (ni in session) {
                    _this.populate('session', ni, 0, session[ni], true);
                }
            }), 0);
        } catch (e) {
            throw new Error('Invalid string passed through window.StorageController');
        }
    }

    (0, _createClass3.default)(StorageController, [{
        key: '_pruneCache',
        value: function _pruneCache(cb) {
            var now = Date.now(),
                freshMem = _storage2.default.memory.get('fresh') || {},
                freshLocal = _storage2.default.local.get('fresh') || {},
                freshSesh = _storage2.default.session.get('fresh') || {};
            var ni = void 0;

            for (ni in freshMem) {
                if (Object.prototype.toString.call(freshMem[ni]) !== '[object Object]' || freshMem[ni].expires < now) {
                    this.remove('memory', ni, false);
                }
            }

            for (ni in freshLocal) {
                if (Object.prototype.toString.call(freshLocal[ni]) !== '[object Object]' || freshLocal[ni].expires < now) {
                    this.remove('local', ni, false);
                }
            }

            for (ni in freshSesh) {
                if (Object.prototype.toString.call(freshSesh[ni]) !== '[object Object]' || freshSesh[ni].expires < now) {
                    this.remove('session', ni, false);
                }
            }

            cb();
        }

        // use this function to register callbacks to the data being changed

    }, {
        key: 'register',
        value: function register(channel, key, cb) {
            var events = _storage2.default.memory.get('events') || {};

            normalizeChannel(channel, 'register');

            if (typeof cb !== 'function') {
                return;
            }

            if (!events.hasOwnProperty(key)) {
                events[key] = [];
            }

            events[key].push(cb);
            _storage2.default.memory.set('events', events);
        }

        // push some data. this will trigger any callbacks attached
        // to the key, passing a clone of the new data as the first param

    }, {
        key: 'populate',
        value: function populate(channel, key, expiration, data) {
            var ignoreFresh = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;

            var _channel = normalizeChannel(channel, 'populate'),
                events = _storage2.default.memory.get('events') || {},
                fresh = _storage2.default[_channel].get('fresh') || {},
                _data = JSON.stringify(data);
            var ni = void 0;

            if (!ignoreFresh) {
                if (!expiration && fresh[key] && Object.prototype.toString.call(fresh[key]) === '[object Object]') {
                    fresh[key] = {
                        hit: Date.now(),
                        expires: Date.now() + (fresh[key].expires - fresh[key].hit)
                    };
                } else {
                    fresh[key] = {
                        hit: Date.now(),
                        expires: Date.now() + expiration
                    };
                }
            } else if (!fresh.hasOwnProperty(key)) {
                fresh[key] = {};
            }

            _storage2.default[_channel].set(key, _data);
            _storage2.default[_channel].set('fresh', fresh);

            if (!events.hasOwnProperty(key)) {
                return;
            }

            for (ni = 0; ni < events[key].length; ni++) {
                events[key][ni](JSON.parse(_data));
            }
        }
    }, {
        key: 'remove',
        value: function remove(channel, key) {
            var fireEvents = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;

            var _channel = normalizeChannel(channel, 'remove'),
                events = _storage2.default.memory.get('events') || {},
                fresh = _storage2.default[_channel].get('fresh') || /* istanbul ignore next */{}; // eslint-disable-line max-len
            var ni = void 0;

            delete fresh[key];

            _storage2.default[_channel].set(key, '{}');
            _storage2.default[_channel].set('fresh', fresh);

            if (!fireEvents || !events.hasOwnProperty(key)) {
                return;
            }

            for (ni = 0; ni < events[key].length; ni++) {
                events[key][ni](false);
            }
        }

        // grab some datas

    }, {
        key: 'get',
        value: function get(channel, key) {
            var _channel = normalizeChannel(channel, 'get'),
                data = _storage2.default[_channel].get(key) || '{}';

            return JSON.parse(data);
        }

        // check on the last time the data was updated

    }, {
        key: 'freshness',
        value: function freshness(channel, key) {
            var _channel = normalizeChannel(channel, 'freshness'),
                data = _storage2.default[_channel].get('fresh') || {};

            if (!data.hasOwnProperty(key)) {
                return 0;
            }

            // cleaning up old formatted data
            /* istanbul ignore if: I havent figured out this test yet */
            if (Object.prototype.toString.call(data[key]) !== '[object Object]') {
                this.remove(channel, key, false);
                return 0;
            }

            return data[key].hit;
        }

        // takes a snapshot of the current state

    }, {
        key: '_out',
        value: function _out() {
            var out = {
                memory: {},
                local: {},
                session: {}
            };

            Object.keys(_storage2.default.memory.get('fresh') || {}).forEach(function (key) {
                out.memory[key] = JSON.parse(_storage2.default.memory.get(key));
            });
            Object.keys(_storage2.default.local.get('fresh') || {}).map(function (key) {
                out.local[key] = JSON.parse(_storage2.default.local.get(key));
            });
            Object.keys(_storage2.default.session.get('fresh') || {}).map(function (key) {
                out.session[key] = JSON.parse(_storage2.default.session.get(key));
            });

            return JSON.stringify(out);
        }

        // use this function for generating the string you pump into
        // a script tag on the server side

    }, {
        key: 'out',
        value: function out() {
            var outStr = new Buffer(this._out()),
                // eslint-disable-line
            str = outStr.toString('base64');

            return 'window.StorageController = "' + str + '";';
        }
    }]);
    return StorageController;
}();

// we use a singleton once so we don't have to use it elsewhere


var outer = new StorageController();

/* istanbul ignore else: no one cares */
if (typeof window !== 'undefined') {
    window.StorageController = outer;
}

exports.StorageController = StorageController;
exports.default = outer;