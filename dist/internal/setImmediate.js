"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=function(n,a){var o,t,r,e,s={},i=n.document,c=1,u=!1,d=void 0,f=void 0;if(n.setImmediate)return n.setImmediate;function m(e){var t=[].slice.call(arguments,1);return function(){"function"==typeof e?e.apply(a,t):new Function(""+e)()}}function l(e){return s[c]=m.apply(a,e),c++}function p(e){var t=void 0;if(u)setTimeout(m(p,e),0);else if(t=s[e]){u=!0;try{t()}finally{g(e),u=!1}}}function g(e){delete s[e]}return f=(f=Object.getPrototypeOf&&Object.getPrototypeOf(n))&&f.setTimeout?f:n,"[object process]"==={}.toString.call(n.process)?d=function(){var e=l(arguments);return process.nextTick(m(p,e)),e}:!function(){var e=void 0,t=void 0;if(n.postMessage&&!n.importScripts)return e=!0,t=n.onmessage,n.onmessage=function(){e=!1},n.postMessage("","*"),n.onmessage=t,e}()?n.MessageChannel?((t=new MessageChannel).port1.onmessage=function(e){p(e.data)},d=function(){var e=l(arguments);return t.port2.postMessage(e),e}):i&&"onreadystatechange"in i.createElement("script")?(o=i.documentElement,d=function(){var e=l(arguments),t=i.createElement("script");return t.onreadystatechange=function(){p(e),t.onreadystatechange=null,o.removeChild(t)},o.appendChild(t),e}):d=function(){var e=l(arguments);return setTimeout(m(p,e),0),e}:(r="setImmediate$"+Math.random()+"$",e=function(e){e.source===n&&"string"==typeof e.data&&0===e.data.indexOf(r)&&p(+e.data.slice(r.length))},n.addEventListener?n.addEventListener("message",e,!1):n.attachEvent("onmessage",e),d=function(){var e=l(arguments);return n.postMessage(r+e,"*"),e}),f.setImmediate=d,f.clearImmediate=g,d}(new Function("return this")());