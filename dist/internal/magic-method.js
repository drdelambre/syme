'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _model = require('../model.js');

var _model2 = _interopRequireDefault(_model);

var _magicArray = require('./magic-array.js');

var _magicArray2 = _interopRequireDefault(_magicArray);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function MagicMethod(obj, def, param, throttle) {
    Object.defineProperty(obj, param, {
        configurable: true,
        get: function get() {
            return def[param].value;
        },
        set: function set(val) {
            var last = def[param].value,
                isArray = Object.prototype.toString.call(def[param].default) === '[object Array]';
            var _val = val,
                valid = true,
                error = void 0,
                ni = void 0,
                a = void 0;

            if (isArray) {
                if (def[param].type) {
                    for (ni = 0; ni < val.length; ni++) {
                        a = val[ni];

                        if (Object.prototype.toString.call(val[ni]) === '[object Array]' || typeof val[ni].fill !== 'function') {
                            val[ni] = new def[param].type(a); // eslint-disable-line
                        }
                    }
                }
            } else if (def[param].type && (def[param].type instanceof _model2.default || def[param].type.prototype instanceof _model2.default) && !(val instanceof def[param].type)) {
                _val = new def[param].type(val); // eslint-disable-line
            }

            // do some validation here
            for (ni = 0; ni < def[param].before.length; ni++) {
                var _def$param$before$ni = def[param].before[ni](_val);

                var _def$param$before$ni2 = (0, _slicedToArray3.default)(_def$param$before$ni, 2);

                error = _def$param$before$ni2[0];
                _val = _def$param$before$ni2[1];

                valid = valid && !error;

                if (!valid) {
                    return;
                }
            }

            if (def[param].value === _val) {
                return;
            }

            if (isArray && !_val.hasOwnProperty('_def')) {
                def[param].value = new _magicArray2.default(def, param, throttle, _val); // eslint-disable-line
            } else {
                def[param].value = _val;
            }

            throttle.add(param, {
                old: last,
                new: def[param].value
            });
        }
    });
}

exports.default = MagicMethod;