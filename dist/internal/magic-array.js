'use strict';Object.defineProperty(exports,"__esModule",{value:true});/**\

    MagicArray
        extends in place array operations to inject
        field contructors and watch events for a
        model's array based fields

        extending native objects must be supported by the
        engine and not transpilers, so the is written in an
        es5 format for correct this binding to the prototype
        functions

\**/function MagicArray(def,param,throttle){var base=arguments.length>3&&arguments[3]!==undefined?arguments[3]:[];if(!(this instanceof MagicArray)){throw new Error('MagicArray: Cannot call a class as a function');}Array.call(this);this._def=def[param];this._param=param;this._throttle=throttle;Array.prototype.splice.apply(this,[0,0].concat(base));}MagicArray.prototype=Object.create(Array.prototype,{contructor:{value:MagicArray,enumerable:false,writable:true,configurable:true}});MagicArray.prototype.push=function(){var old=this.slice(0),ni;for(var _len=arguments.length,args=Array(_len),_key=0;_key<_len;_key++){args[_key]=arguments[_key];}if(this._def.type){for(ni=0;ni<args.length;ni++){if(typeof args[ni].out==='function'){args[ni]=args[ni].out();}args[ni]=new this._def.type(args[ni]);// eslint-disable-line
}}// do some validation here
Array.prototype.push.apply(this,args);this._throttle.add(this._param,{old:old,new:this.slice(0)});this._def.value=this;return this;};MagicArray.prototype.pop=function(){var old=this.slice(0),out;// do some validation here
out=Array.prototype.pop.apply(this);this._throttle.add(this._param,{old:old,new:this.slice(0)});this._def.value=this;return out;};MagicArray.prototype.shift=function(){var old=this.slice(0);// do some validation here
Array.prototype.shift.apply(this);this._throttle.add(this._param,{old:old,new:this.slice(0)});this._def.value=this;return this;};MagicArray.prototype.unshift=function(){var old=this.slice(0),ni,out;for(var _len2=arguments.length,args=Array(_len2),_key2=0;_key2<_len2;_key2++){args[_key2]=arguments[_key2];}if(this._def.type){for(ni=0;ni<args.length;ni++){if(args[ni]instanceof this._def.type){continue;}args[ni]=new this._def.type(args[ni]);// eslint-disable-line
}}// do some validation here
out=Array.prototype.unshift.apply(this,args);this._throttle.add(this._param,{old:old,new:this.slice(0)});this._def.value=this;return out;};MagicArray.prototype.splice=function(){var old=this.slice(0),ni;for(var _len3=arguments.length,args=Array(_len3),_key3=0;_key3<_len3;_key3++){args[_key3]=arguments[_key3];}if(this._def.type&&args.length>2){for(ni=2;ni<args.length;ni++){if(args[ni]instanceof this._def.type){continue;}args[ni]=new this._def.type(args[ni]);// eslint-disable-line
}}// do some validation here
Array.prototype.splice.apply(this,args);this._throttle.add(this._param,{old:old,new:this.slice(0)});this._def.value=this;return this;};MagicArray.prototype.concat=function(){for(var _len4=arguments.length,args=Array(_len4),_key4=0;_key4<_len4;_key4++){args[_key4]=arguments[_key4];}return Array.prototype.concat.apply(this.slice(0),args);};exports.default=MagicArray;