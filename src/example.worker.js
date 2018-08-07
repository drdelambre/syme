import store from 'internal/store';

const channels = {
    local: {
        store: store.local,
        ports: {}
    },
    session: {
        store: store.session,
        ports: {}
    },
    memory: {
        store: store.memory,
        ports: {}
    }
};

function register(channel, key, port) {
    if (!channels[channel].ports.hasOwnProperty(key)) {
        channels[channel].ports[key] = [];
    }

    channels[channel].ports[key].push(port);
}

function update(channel, key, expiration, data) {
    channels[channel].store.set(key, data);

    if (!channels[channel].ports.hasOwnProperty(key)) {
        return;
    }

    channels[channel].ports[key].forEach((port) => {
        port.postMessage({
            action: 'update',
            payload: {
                channel: channel,
                key: key,
                expiration: expiration,
                data: data
            }
        });
    });
}

function remove(channel, key, shouldUpdate = true) {
    channels[channel].store.set(key, null);

    if (!shouldUpdate) {
        return;
    }

    if (!channels[channel].ports.hasOwnProperty(key)) {
        return;
    }

    channels[channel].ports[key].forEach((port) => {
        port.postMessage({
            action: 'update',
            payload: {
                channel: channel,
                key: key,
                expiration: Date.now(),
                data: null
            }
        });
    });
}

onconnect = (e) => {
    const port = e.ports[0];
    let channel,
        key,
        expiration,
        data,
        shouldUpdate;

    port.addEventListener('message', (e) => {
        if (!e.data.hasOwnProperty('action')) {
            return;
        }

        switch (e.data.action) {
            case 'register':
                ({
                    channel,
                    key
                } = e.data.payload);

                register(
                    channel,
                    key,
                    port
                );

                break;

            case 'update':
                ({
                    channel,
                    key,
                    expiration,
                    data
                } = e.data.payload);

                update(
                    channel,
                    key,
                    expiration,
                    data
                );

                break;

            case 'remove':
                ({
                    channel,
                    key,
                    shouldUpdate
                } = e.data.payload);

                remove(
                    channel,
                    key,
                    shouldUpdate
                );

                break;

            default:
                break;
        }
    });

    port.start();
};

