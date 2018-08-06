import StorageController from 'internal/storage-controller';
import Observer from 'internal/observer';

/**\

    Cache
        A simple to use mechanism for keeping data fresh

\**/
class Cache {
    constructor(def) {
        const _def = def || {};

        this.key = _def.key || this.constructor.name;
        this.channel = _def.channel || 'memory';
        this.expiration = parseInt(_def.expiration || 500, 10);

        this.controller = StorageController;

        if (!/^(memory|local|session)$/.test(this.channel)) {
            throw new Error([
                'Invalid storage mechanism sent',
                `to ${this.constructor.name}.channel`
            ].join(' '));
        }

        // we only concern ourself with building a context
        // in memory on the server

        /* istanbul ignore next */
        if (typeof window === 'undefined') {
            this.channel = 'memory';
        }

        if (isNaN(this.expiration)) {
            throw new Error([
                'Invalid expiration time set for',
                `${this.constructor.name}.expiration`
            ].join(' '));
        }

        if (_def.model) {
            this.model = _def.model;
        }

        Object.defineProperty(this, 'cached', {
            get() {
                const stored = this.controller.get(this.channel, this.key),
                    fresh = this.controller.freshness(
                        this.channel,
                        this.key
                    );

                /* istanbul ignore if: cannot test this right now */
                if (
                    (!fresh && Object.keys(stored).length) ||
                    (fresh && Date.now() - fresh < this.expiration)
                ) {
                    if (this.model) {
                        const model = new this.model();

                        model.fill(stored);

                        return model;
                    }

                    return stored;
                }

                /* istanbul ignore if: cannot test this right now */
                if (fresh) {
                    //delete cache entry
                    this.controller.remove(
                        this.channel,
                        this.key,
                        false
                    );
                }

                return false;
            },
            set() {
                throw new Error('cached is a read only property');
            }
        });
    }

    populate(data) {
        let _data = data;

        if (this.model && data instanceof this.model) {
            _data = data.out();
        }

        this.controller.populate(
            this.channel,
            this.key,
            this.expiration,
            _data
        );

        return this;
    }

    clear() {
        this.controller.remove(
            this.channel,
            this.key
        );

        return this;
    }

    watch(callback) {
        return this.controller.register(this.channel, this.key, (data) => {
            if (this.model) {
                const model = new this.model();

                model.fill(data);

                callback(model);
            } else {
                callback(data);
            }
        });
    }

    // sometimes we want to override the default storage mechanism
    registerWorker(worker, shared = true) {
        const _worker = shared ? worker.port : worker;
        const out = {
            populate(channel, key, expiration, data) {
                _worker.postMessage({
                    action: 'update',
                    payload: {
                        channel: channel,
                        key: key,
                        expiration: expiration,
                        data: data
                    }
                });
            },
            freshness(channel, key) { // eslint-disable-line
                return out._exp;
            },
            remove(channel, key, shouldUpdate) {
                delete out._exp;

                _worker.postMessage({
                    action: 'remove',
                    payload: {
                        channel: channel,
                        key: key,
                        shouldUpdate: shouldUpdate
                    }
                });
            },
            register: (() => {
                const ob = new Observer(),
                    ret = (channel, key, cb) => {
                        return ob(cb);
                    };

                ret.fire = (...args) => { ob.fire.apply(ob, args); };

                return ret;
            })()
        };

        _worker.addEventListener('message', (evt) => {
            // all update messages should follow the format
            // of {
            //     action: 'update',
            //     payload: { channel, key, expiration, data }
            // }

            if (evt.data.action !== 'update') {
                return;
            }

            const {
                channel,
                key,
                expiration,
                data
            } = evt.data.payload;

            if (
                channel !== this.channel ||
                key !== this.key
            ) {
                return;
            }

            out._exp = expiration;
            out.register.fire(data);
        });

        if (shared) {
            _worker.postMessage({
                action: 'register',
                payload: {
                    channel: this.channel,
                    key: this.key
                }
            });
        }

        this.controller = out;
    }
}

export default Cache;
