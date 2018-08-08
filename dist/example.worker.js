"use strict";var _store=require("./internal/store"),_store2=_interopRequireDefault(_store);function _interopRequireDefault(e){return e&&e.__esModule?e:{default:e}}var channels={local:{store:_store2.default.local,ports:{}},session:{store:_store2.default.session,ports:{}},memory:{store:_store2.default.memory,ports:{}}};function register(e,a,t){channels[e].ports.hasOwnProperty(a)||(channels[e].ports[a]=[]),channels[e].ports[a].push(t)}function update(a,t,n,o){channels[a].store.set(t,o),channels[a].ports.hasOwnProperty(t)&&channels[a].ports[t].forEach(function(e){e.postMessage({action:"update",payload:{channel:a,key:t,expiration:n,data:o}})})}function remove(a,t){var e=!(2<arguments.length&&void 0!==arguments[2])||arguments[2];channels[a].store.set(t,null),e&&channels[a].ports.hasOwnProperty(t)&&channels[a].ports[t].forEach(function(e){e.postMessage({action:"update",payload:{channel:a,key:t,expiration:Date.now(),data:null}})})}function query(e,a,t,n){var o=channels[e].store.get(a);t.postMessage({action:"query",payload:{uuid:n,data:o}})}onconnect=function(e){var r=e.ports[0],s=void 0,i=void 0,c=void 0,l=void 0,d=void 0,u=void 0;r.addEventListener("message",function(e){if(e.data.hasOwnProperty("action"))switch(e.data.action){case"register":var a=e.data.payload;s=a.channel,i=a.key,register(s,i,r);break;case"update":var t=e.data.payload;s=t.channel,i=t.key,c=t.expiration,l=t.data,update(s,i,c,l);break;case"remove":var n=e.data.payload;s=n.channel,i=n.key,d=n.shouldUpdate,remove(s,i,d);break;case"query":var o=e.data.payload;s=o.channel,i=o.key,u=o.uuid,query(s,i,r,u)}}),r.start()};