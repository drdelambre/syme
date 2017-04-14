import ThrottledObserver from 'internal/throttled-observer.js';
import MagicArray from 'internal/magic-array.js';
import MagicMethod from 'internal/magic-method.js';

var blacklist = new RegExp(
    '^(_.*|constructor|onUpdate|fill|out|errors|validate|extend|' +
    'keys|toString|toLocaleString|valueOf|hasOwnProperty|' +
    'isPrototypeOf|propertyIsEnumerable|should|before|clear)$'
);

const TOSTR = Object.prototype.toString;

/**\

    Model

    jazz up them boring javascript objects

\**/
class Model {
    constructor(definition) {
        this._def = {};
        this._changeThrottle = new ThrottledObserver();

        this.extend(definition);
    }

    /**\

        Model.onUpdate

        connect callbacks to specific property updates after they've
        been assigned. usage of the string '*' will fire the callback
        if any property changes. changes are also cached into a 10ms
        bucket, so many assignments will be compressed to one change:

            var model = Model({
                    id: 12
                })
                .onUpdate('id', function(change) {
                    console.log('changed', change);
                });
            model.id = -37;
            model.id = 'yolo';
            model.id = { };
            model.id = 13;
            model.id = 'new value';

        will output:
            changed { old: 12, new: 'new value' }

    \**/
    onUpdate(field, callback) {
        this._changeThrottle.onFire(field, callback);
    }

    /**\

        Model.fill

        takes a boring old javascript object and loads it into the model.
        most of this functionality, and the rules by which this happens,
        is set up from the Model.extend function

    \**/
    fill(data) {
        var _data = data,
            ni;

        if (data instanceof Model) {
            _data = data.out();
        }

        for (ni in _data) {
            if (!this._def.hasOwnProperty(ni)) {
                continue;
            }

            this[ni] = _data[ni];
        }

        return this;
    }

    /**\

        Model.clear

        resets a model to it's default values

    \**/
    clear() {
        let ni, no;

        for (ni in this._def) {
            no = this._def[ni].default;
            if (this._def[ni].value instanceof Model) {
                this[ni].clear();
            } else if (
                TOSTR.call(no) === '[object Array]'
            ) {
                this[ni] = new MagicArray(
                        this._def,
                        ni,
                        this._changeThrottle
                    );
            } else {
                this[ni] = no;
            }
        }

        return this;
    }

    /**\

        Model.out

        serializes all of the properties of the model, transforming them
        from rich and dynamic models, to plain old javascript objects to
        allow for easier (and cleaner) transference between modules

    \**/
    out() {
        var out = {},
            ni, no, a,
            val;

        for (ni in this._def) {
            val = this._def[ni].value;

            if (TOSTR.call(this._def[ni].default) === '[object Array]') {
                a = [];

                if (this._def[ni].type) {
                    for (no = 0; no < val.length; no++) {
                        /* istanbul ignore else */
                        if (val[no] instanceof Model) {
                            a.push(val[no].out());
                        }
                    }
                } else {
                    a = val.slice(0);
                }

                out[ni] = a;
                continue;
            }

            if (val instanceof Model) {
                out[ni] = val.out();
                continue;
            }

            out[ni] = val;
        }

        return out;
    }

    /**\

        Model.extend

        sets up properties on the model. there's a few syntactic rules:
        { id: 0 }
            sets up a simple property with a default value
        { items: [] }
            sets up a simple array, connected to the onUpdate and
            before subsytems
        { user: User }
            if the default value is another Model, object hierarchies
            get set up, calling their constructor on creation or fill
            on subsequent assignments/fills
        { users: [ User ] }
            connecting the basic array definition with the object
            hierarchy machanism. Makin cool stuff happen.

    \**/
    extend(def) {
        var ni;

        for (ni in def) {
            if (blacklist.test(ni)) {
                continue;
            }

            if (def[ni] instanceof Model ||
                    (typeof def[ni] === 'function' &&
                        def[ni].prototype instanceof Model)) {
                this._def[ni] = {
                    'default': null,
                    value: new def[ni](),
                    type: def[ni],
                    before: []
                };
            } else if (TOSTR.call(def[ni]) === '[object Array]') {
                this._def[ni] = {
                    'default': [],
                    type: def[ni].length ? def[ni][0] : null,
                    before: []
                };

                this._def[ni].value = new MagicArray(
                    this._def,
                    ni,
                    this._changeThrottle
                );
            } else {
                this._def[ni] = {
                    'default': def[ni],
                    value: def[ni],
                    type: null,
                    before: []
                };
            }

            MagicMethod(this, this._def, ni, this._changeThrottle); // eslint-disable-line
        }

        return this;
    }

    /**\

        Model.before

        Sets up a collection of functions to validate or transform
        assignments. Each function should return an array of
            [ has_error, transformed_value ]
        Assignment of the value to the property is canceled if has_error
        returns true in any of the validation functions and transformation is
        done in order of function assignment to the property. The
        transformation chain is stopped the first time a function returns
        an error state

    \**/
    before(def) {
        var ni;

        function isFunc(val) {
            return typeof val === 'function';
        }

        for (ni in def) {
            if (!this._def.hasOwnProperty(ni)) {
                throw new Error(
                    'Model: called before on a property (' +
                    ni + ') that does not exist');
            }

            if (TOSTR.call(def[ni]) !== '[object Array]') {
                def[ni] = [ def[ni] ];
            }

            def[ni].filter(isFunc);

            this._def[ni].before = this._def[ni].before.concat(def[ni]);
        }

        return this;
    }

    /**\

        Model.keys

        returns a list of all properties and functions attached to
        the model, minus the default built in ones

    \**/
    keys() {
        var out = [],
            tmp = {},
            curr = this, // eslint-disable-line
            props, ni;

        do {
            props = Object.getOwnPropertyNames(curr);
            for (ni = 0; ni < props.length; ni++) {
                if (blacklist.test(props[ni])) {
                    continue;
                }
                tmp[props[ni]] = true;
            }
        } while ((curr = Object.getPrototypeOf(curr)));

        for (ni in tmp) {
            out.push(ni);
        }

        return out;
    }
}

export default Model;
