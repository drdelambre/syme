const ALPHA = '0123456789' +
    'abcdefghijklmnopqrstuvwxyz' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    random = (() => {
        if (typeof window === 'undefined') {
            return require('crypto').randomBytes;
        }

        return (bytes) => {
            return (window.crypto || window.msCrypto)
                .getRandomValues(new Uint8Array(bytes));
        };
    })();

function uuid(size = 21) {
    const bytes = random(size);
    let id = '',
        _size = size;

    while (_size-- > 0) {
        id += ALPHA[bytes[_size] & 61];
    }

    return id;
}

export { uuid };

export default function Observer() {
    const cbs = {},
        maxCollisions = 20,
        ret = (cb) => {
            if (typeof cb !== 'function') {
                return;
            }

            let id = uuid(),
                collisions = 0;

            while (cbs.hasOwnProperty(id)) {
                if (++collisions > maxCollisions) {
                    throw new Error('Max collisions hit in observer');
                }

                id = uuid();
            }

            cbs[id] = cb;

            return {
                remove() {
                    delete cbs[id];
                }
            };
        };

    ret.fire = (...args) => {
        const keys = Object.keys(cbs);
        let ni;

        for (ni = 0; ni < keys.length; ni++) {
            cbs[keys[ni]].apply(cbs[keys[ni]], args);
        }
    };

    return ret;
}


