"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t};function type(t,e){var o,n,r=void 0===t?"undefined":_typeof(t),y=!1;if(arguments.length&&"object"===_typeof(t)&&!t&&(r="null"),"object"===r&&("[object Array]"===(o=Object.prototype.toString.call(t))?r="array":"[object Null]"===o?r="null":"[object Date]"===o?r="date":"[object DOMWindow]"===o||"[object HTMLDocument]"===o||"[object Window]"===o||"[object global]"===o?r="node":t.nodeType&&(r=1===t.nodeType?"node":"textnode")),!e)return r;for(n=e.split(","),o=0;o<n.length;o++)y=y||n[o].trim()===r;return y}exports.default=type;