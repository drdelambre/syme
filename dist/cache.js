'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _storageController = require('./internal/storage-controller');

var _storageController2 = _interopRequireDefault(_storageController);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**\

    Cache
        A simple to use mechanism for keeping data fresh

\**/
var Cache = function () {
    function Cache(def) {
        (0, _classCallCheck3.default)(this, Cache);

        var _def = def || {};

        this.key = _def.key || this.constructor.name;
        this.channel = _def.channel || 'memory';
        this.expiration = parseInt(_def.expiration || 500, 10);

        if (!/^(memory|local|session)$/.test(this.channel)) {
            throw new Error(['Invalid storage mechanism sent', 'to ' + this.constructor.name + '.channel'].join(' '));
        }

        // we only concern ourself with building a context
        // in memory on the server

        /* istanbul ignore next */
        if (typeof window === 'undefined') {
            this.channel = 'memory';
        }

        if (isNaN(this.expiration)) {
            throw new Error(['Invalid expiration time set for', this.constructor.name + '.expiration'].join(' '));
        }

        Object.defineProperty(this, 'cached', {
            get: function get() {
                var stored = _storageController2.default.get(this.channel, this.key),
                    fresh = _storageController2.default.freshness(this.channel, this.key);

                /* istanbul ignore if: cannot test this right now */
                if (!fresh && Object.keys(stored).length) {
                    return stored;
                }

                if (fresh && Date.now() - fresh < this.expiration) {
                    return stored;
                }

                /* istanbul ignore if: cannot test this right now */
                if (fresh) {
                    //delete cache entry
                    _storageController2.default.remove(this.channel, this.key, false);
                }

                return false;
            },
            set: function set() {
                throw new Error('cached is a read only property');
            }
        });
    }

    (0, _createClass3.default)(Cache, [{
        key: 'populate',
        value: function populate(data) {
            _storageController2.default.populate(this.channel, this.key, this.expiration, data);

            return this;
        }
    }, {
        key: 'clear',
        value: function clear() {
            _storageController2.default.remove(this.channel, this.key);

            return this;
        }
    }, {
        key: 'watch',
        value: function watch(callback) {
            _storageController2.default.register(this.channel, this.key, function (data) {
                callback(data);
            });

            return this;
        }
    }]);
    return Cache;
}();

exports.default = Cache;