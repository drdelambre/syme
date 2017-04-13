const THROTTLE = 10;

function clone(obj) {
    const out = {};
    let ni;

    for (ni in obj) {
        out[ni] = obj[ni];
    }

    return out;
}

function ThrottledObserver() {
    const _cache = {},
        _callbacks = {},
        throttle = {};
    let _timer;

    throttle.add = function(scope, evt) {
        if (!Object.keys(_callbacks).length) {
            return;
        }

        if (
            !_callbacks.hasOwnProperty(scope) &&
            !_callbacks.hasOwnProperty('*')
        ) {
            return;
        }

        // const _evt = { new: evt};

        if (
            _cache.hasOwnProperty(scope) &&
            _cache[scope].hasOwnProperty('old')
        ) {
            evt.old = _cache[scope].old;
        }

        _cache[scope] = evt;

        if (_timer) {
            return;
        }

        _timer = setTimeout(throttle.fire, THROTTLE);
    };

    throttle.onFire = function(scope, callback) {
        if (typeof callback !== 'function') {
            return;
        }

        if (!_callbacks.hasOwnProperty(scope)) {
            _callbacks[scope] = [];
        }

        _callbacks[scope].push(callback);
    };

    throttle.fire = function() {
        let ni, no;

        if (!Object.keys(_cache).length) {
            _timer = null;
            return;
        }

        if (_callbacks.hasOwnProperty('*')) {
            no = clone(_cache);
            for (ni = 0; ni < _callbacks['*'].length; ni++) {
                _callbacks['*'][ni](no);
            }
        }

        for (ni in _cache) {
            if (_callbacks && _callbacks.hasOwnProperty(ni)) {
                for (no = 0; no < _callbacks[ni].length; no++) {
                    _callbacks[ni][no](_cache[ni]);
                }
            }

            delete _cache[ni];
        }

        _timer = null;
    };

    return throttle;
}

export default ThrottledObserver;
