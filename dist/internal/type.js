'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof2 = require('babel-runtime/helpers/typeof');

var _typeof3 = _interopRequireDefault(_typeof2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// type:
//      lets shrink some code. Calling without the type variable
//      just returns the type, calling it with returns a boolean
//      you can pass a comma seperated list of types to match against
function type(variable, typeStr) {
    var t = typeof variable === 'undefined' ? 'undefined' : (0, _typeof3.default)(variable),
        trap = false,
        more,
        split;

    // Addresses a PhantomJS bug that turns a null variable into 'window'
    // https://github.com/ariya/phantomjs/issues/13617
    if (arguments.length && (0, _typeof3.default)(arguments[0]) === 'object' && !arguments[0]) {
        t = 'null';
    }

    if (t === 'object') {
        more = Object.prototype.toString.call(variable);

        if (more === '[object Array]') {
            t = 'array';
        } else if (more === '[object Null]') {
            /* istanbul ignore next: environment specific */
            t = 'null';
        } else if (more === '[object Date]') {
            t = 'date';
        } else if (more === '[object DOMWindow]' || more === '[object HTMLDocument]' || more === '[object Window]' || more === '[object global]') {
            t = 'node';
        } else if (variable.nodeType) {
            if (variable.nodeType === 1) {
                t = 'node';
            } else {
                t = 'textnode';
            }
        }
    }

    if (!typeStr) {
        return t;
    }

    split = typeStr.split(',');
    for (more = 0; more < split.length; more++) {
        trap = trap || split[more].trim() === t;
    }

    return trap;
}

exports.default = type;