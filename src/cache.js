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

        Object.defineProperty(this, 'cached', {
            get() {
                const stored = StorageController.get(this.channel, this.key),
                    fresh = StorageController.freshness(
                        this.channel,
                        this.key
                    );

                /* istanbul ignore if: cannot test this right now */
                if (!fresh && Object.keys(stored).length) {
                    return stored;
                }

                if (fresh && Date.now() - fresh < this.expiration) {
                    return stored;
                }

                /* istanbul ignore if: cannot test this right now */
                if (fresh) {
                    //delete cache entry
                    StorageController.remove(
                        this.channel,
                        this.key
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
        StorageController.populate(
            this.channel,
            this.key,
            this.expiration,
            data
        );

        return this;
    }

    watch(callback) {
        StorageController.register(this.channel, this.key, (data) => {
            callback(data);
        });

        return this;
    }
}

export default Cache;
