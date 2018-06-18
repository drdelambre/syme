import StorageController from 'internal/storage-controller';

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
                const stored = StorageController.get(this.channel, this.key),
                    fresh = StorageController.freshness(
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
                    StorageController.remove(
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

        StorageController.populate(
            this.channel,
            this.key,
            this.expiration,
            _data
        );

        return this;
    }

    clear() {
        StorageController.remove(
            this.channel,
            this.key
        );

        return this;
    }

    watch(callback) {
        StorageController.register(this.channel, this.key, (data) => {
            if (this.model) {
                const model = new this.model();

                model.fill(data);

                callback(model);
            } else {
                callback(data);
            }
        });

        return this;
    }
}

export default Cache;
