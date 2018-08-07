import uuid from 'internal/uuid';

export default function Observer() {
    const cbs = {},
        maxCollisions = 20,
        ret = (cb) => {
            if (typeof cb !== 'function') {
                return;
            }

            let id = uuid(),
                collisions = 0;

            /* istanbul ignore next: just for piece of mind */
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


