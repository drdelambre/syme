import store from 'internal/storage';

function normalizeChannel(channel, func) {
    if (!/^(memory|local|session)$/.test(channel)) {
        throw new Error(
            `Invalid storage mechanism sent to StorageController.${func}`
        );
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
class StorageController {
    constructor() {
        if (typeof window === 'undefined' || !window.StorageController) {
            return;
        }

        try {
            const initial = JSON.parse(window.atob(window.StorageController));

            if (
                Object.prototype.toString.call(initial) !== '[object Object]'
            ) {
                throw new Error('invalid type');
            }

            setTimeout(this._pruneCache.bind(this, () => {
                const memory = initial.memory || {},
                    local = initial.local || {},
                    session = initial.session || {};
                let ni;

                for (ni in memory) {
                    this.populate('memory', ni, 0, memory[ni], true);
                }

                for (ni in local) {
                    this.populate('local', ni, 0, local[ni], true);
                }

                for (ni in session) {
                    this.populate('session', ni, 0, session[ni], true);
                }
            }), 0);
        } catch (e) {
            throw new Error(
                'Invalid string passed through window.StorageController'
            );
        }
    }

    _pruneCache(cb) {
        const now = Date.now(),
            freshMem = store.memory.get('fresh') || {},
            freshLocal = store.local.get('fresh') || {},
            freshSesh = store.session.get('fresh') || {};
        let ni;

        for (ni in freshMem) {
            if (
                Object.prototype.toString
                    .call(freshMem[ni]) !== '[object Object]' ||
                freshMem[ni].expires < now
            ) {
                this.remove('memory', ni, false);
            }
        }

        for (ni in freshLocal) {
            if (
                Object.prototype.toString
                    .call(freshLocal[ni]) !== '[object Object]' ||
                freshLocal[ni].expires < now
            ) {
                this.remove('local', ni, false);
            }
        }

        for (ni in freshSesh) {
            if (
                Object.prototype.toString
                    .call(freshSesh[ni]) !== '[object Object]' ||
                freshSesh[ni].expires < now
            ) {
                this.remove('session', ni, false);
            }
        }

        cb();
    }

    // use this function to register callbacks to the data being changed
    register(channel, key, cb) {
        const events = store.memory.get('events') || {};

        normalizeChannel(channel, 'register');

        if (typeof cb !== 'function') {
            return;
        }

        if (!events.hasOwnProperty(key)) {
            events[key] = [];
        }

        events[key].push(cb);
        store.memory.set('events', events);
    }

    // push some data. this will trigger any callbacks attached
    // to the key, passing a clone of the new data as the first param
    populate(channel, key, expiration, data, ignoreFresh = false) {
        const _channel = normalizeChannel(channel, 'populate'),
            events = store.memory.get('events') || {},
            fresh = store[_channel].get('fresh') || {},
            _data = JSON.stringify(data);
        let ni;

        if (!ignoreFresh) {
            if (
                !expiration &&
                fresh[key] &&
                Object.prototype.toString
                    .call(fresh[key]) === '[object Object]'
            ) {
                fresh[key] = {
                    hit: Date.now(),
                    expires: (
                        Date.now() + (fresh[key].expires - fresh[key].hit)
                    )
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

        store[_channel].set(key, _data);
        store[_channel].set('fresh', fresh);

        if (!events.hasOwnProperty(key)) {
            return;
        }

        for (ni = 0; ni < events[key].length; ni++) {
            events[key][ni](JSON.parse(_data));
        }
    }

    remove(channel, key, fireEvents = true) {
        const _channel = normalizeChannel(channel, 'remove'),
            events = store.memory.get('events') || {},
            fresh = store[_channel].get('fresh') || /* istanbul ignore next */ {}; // eslint-disable-line max-len
        let ni;

        delete fresh[key];

        store[_channel].set(key, '{}');
        store[_channel].set('fresh', fresh);

        if (!fireEvents || !events.hasOwnProperty(key)) {
            return;
        }

        for (ni = 0; ni < events[key].length; ni++) {
            events[key][ni](false);
        }
    }

    // grab some datas
    get(channel, key) {
        const _channel = normalizeChannel(channel, 'get'),
            data = store[_channel].get(key) || '{}';

        return JSON.parse(data);
    }

    // check on the last time the data was updated
    freshness(channel, key) {
        const _channel = normalizeChannel(channel, 'freshness'),
            data = store[_channel].get('fresh') || {};

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
    _out() {
        const out = {
            memory: {},
            local: {},
            session: {}
        };

        Object.keys(store.memory.get('fresh') || {}).forEach((key) => {
            out.memory[key] = JSON.parse(store.memory.get(key));
        });
        Object.keys(store.local.get('fresh') || {}).map((key) => {
            out.local[key] = JSON.parse(store.local.get(key));
        });
        Object.keys(store.session.get('fresh') || {}).map((key) => {
            out.session[key] = JSON.parse(store.session.get(key));
        });

        return JSON.stringify(out);
    }

    // use this function for generating the string you pump into
    // a script tag on the server side
    out() {
        const outStr = new Buffer(this._out()), // eslint-disable-line
            str = outStr.toString('base64');

        return `window.StorageController = "${str}";`;
    }
}

// we use a singleton once so we don't have to use it elsewhere
const outer = new StorageController();

/* istanbul ignore else: no one cares */
if (typeof window !== 'undefined') {
    window.StorageController = outer;
}

export { StorageController };
export default outer;
