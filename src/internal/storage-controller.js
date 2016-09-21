import store from 'internal/storage';

function deepClone(obj) {
    const _obj = JSON.parse(JSON.stringify(obj));

    return _obj;
}

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
            const initial = JSON.parse(window.StorageController);

            if (Object.prototype.toString.call(initial) !== '[object Object]') {
                throw new Error('invalid type');
            }

            const memory = initial.memory || {},
                local = initial.local || {},
                session = initial.session || {};
            let ni;

            for (ni in memory) {
                this.populate('memory', ni, memory[ni], true);
            }

            for (ni in local) {
                this.populate('local', ni, local[ni], true);
            }

            for (ni in session) {
                this.populate('session', ni, session[ni], true);
            }
        } catch (e) {
            throw new Error(
                'Invalid string passed through window.StorageController'
            );
        }
    }

    // use this function to register callbacks to the data being changed
    register(channel, key, cb) {
        const _channel = normalizeChannel(channel, 'register'),
            events = store.memory.get('events') || {},
            data = store[_channel].get('data') || {};

        if (typeof cb !== 'function') {
            return;
        }

        if (!events.hasOwnProperty(key)) {
            events[key] = [];
        }

        events[key].push(cb);
        store.memory.set('events', events);

        if (data.hasOwnProperty(key)) {
            cb(deepClone(data[key]));
        }
    }

    // push some data. this will trigger any callbacks attached
    // to the key, passing a clone of the new data as the first param
    populate(channel, key, data, ignoreFresh = false) {
        const _channel = normalizeChannel(channel, 'populate'),
            events = store.memory.get('events') || {},
            fresh = store[_channel].get('fresh') || {},
            _data = store[_channel].get('data') || {};
        let ni;

        if (!ignoreFresh) {
            fresh[key] = Date.now();
        }

        _data[key] = deepClone(data);

        store[_channel].set('data', _data);
        store[_channel].set('fresh', fresh);

        if (!events.hasOwnProperty(key)) {
            return;
        }

        for (ni = 0; ni < events[key].length; ni++) {
            events[key][ni](deepClone(data));
        }
    }

    // grab some datas
    get(channel, key) {
        const _channel = normalizeChannel(channel, 'get'),
            data = store[_channel].get('data') || {};

        return deepClone(data[key] || {});
    }

    // check on the last time the data was updated
    freshness(channel, key) {
        const _channel = normalizeChannel(channel, 'freshness'),
            data = store[_channel].get('fresh') || {};

        return data[key] || 0;
    }

    // takes a snapshot of the current state
    _out() {
        return JSON.stringify({
            memory: store.memory.get('data') || {},
            local: store.local.get('data') || {},
            session: store.session.get('data') || {}
        });
    }

    // use this function for generating the string you pump into
    // a script tag on the server side
    out() {
        const outStr = this._out()
            .replace(/\n/g, '\\n')
            .replace(/\\n/g, '\\\\n')
            .replace(/'/g, '\\\'');

        return `window.StorageController = '${outStr}';`;
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
