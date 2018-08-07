const ALPHA = '0123456789' +
    'abcdefghijklmnopqrstuvwxyz' +
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    random = (() => {
        /* istanbul ignore if: not testing the server */
        if (typeof window === 'undefined') {
            return require('crypto').randomBytes;
        }

        return (bytes) => {
            return (
                window.crypto ||
                /* istanbul ignore next: polyfill */ window.msCrypto
            )
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

export default uuid;

