function testForLocalStorage() {
    /* istanbul ignore if: not testing server yet */
    if (typeof window === 'undefined' || !window.document) {
        return false;
    }

    const uid = '' + Date.now();

    try {
        window.localStorage.setItem(uid, uid);

        const works = (window.localStorage.getItem(uid) === uid);

        window.localStorage.removeItem(uid);

        return works;
    } catch (exception) {
        /* istanbul ignore next: client is speced correctly */
        return false;
    }
}

function testForSessionStorage() {
    /* istanbul ignore if: not testing server yet */
    if (typeof window === 'undefined' || !window.document) {
        return false;
    }

    const uid = '' + Date.now();

    try {
        window.sessionStorage.setItem(uid, uid);

        const works = (window.sessionStorage.getItem(uid) === uid);

        window.sessionStorage.removeItem(uid);

        return works;
    } catch (exception) {
        /* istanbul ignore next: client is speced correctly */
        return false;
    }
}

function generateMemoryStore() {
    /* istanbul ignore if: not testing server yet */
    if (typeof window === 'undefined' || !window.document) {
        const getNamespace = require('continuation-local-storage').getNamespace;

        return {
            get(key) {
                const namespace = getNamespace('ServerState');

                if (!namespace.get) {
                    throw new Error([
                        '',
                        'Server misconfigured:',
                        '\tPlease make sure to create the namespace before using the',
                        '\tcache system on the server.',
                        '\thttps://github.com/drdelambre/syme#cache-serverside',
                        ''
                    ].join('\n'));
                }

                return namespace.get(key);
            },
            set(key, val) {
                const namespace = getNamespace('ServerState');

                if (!namespace.set) {
                    throw new Error([
                        '',
                        'Server misconfigured:',
                        '\tPlease make sure to create the namespace before using the',
                        '\tcache system on the server.',
                        '\thttps://github.com/drdelambre/syme#cache-serverside',
                        ''
                    ].join('\n'));
                }

                return namespace.set(key, val);
            },
            clear() {}
        };
    }

    const state = {};

    return {
        get(key) {
            return state[key];
        },
        set(key, val) {
            state[key] = val;
        },
        clear() {
            let ni;

            for (ni in state) {
                delete state[ni];
            }
        }
    };
}

function generateSessionStore() {
    /* istanbul ignore else: this always returns true on phantom */
    if (testForSessionStorage()) {
        return {
            get(key) {
                const val = window.sessionStorage.getItem(key);

                if (val) {
                    return JSON.parse(val);
                }

                return null;
            },
            set(key, val) {
                window.sessionStorage.setItem(key, JSON.stringify(val));
            },
            clear() {
                window.sessionStorage.clear();
            }
        };
    }

    /* istanbul ignore next: we can assume this is safe? */
    return generateMemoryStore();
}

function generateLocalStore() {
    /* istanbul ignore else: this always returns true on phantom */
    if (testForLocalStorage()) {
        return {
            get(key) {
                const val = window.localStorage.getItem(key);

                if (val) {
                    return JSON.parse(val);
                }

                return null;
            },
            set(key, val) {
                window.localStorage.setItem(key, JSON.stringify(val));
            },
            clear() {
                window.localStorage.clear();
            }
        };
    }

    /* istanbul ignore next: we can assume this is safe? */
    return generateSessionStore();
}

const storage = {
    memory: generateMemoryStore(),
    local: generateLocalStore(),
    session: generateSessionStore()
};

export {
    testForLocalStorage,
    testForSessionStorage
};
export default storage;
