import { StorageController } from 'base/internal/storage-controller';
import store from 'base/internal/storage';

describe('Storage Controller', () => {
    beforeEach(() => {
        store.memory.clear();
        store.session.clear();
        store.local.clear();

        delete window.StorageController;
    });

    it('should explode on jibber jabber', () => {
        window.StorageController = 'jibber jabber';

        /* eslint-disable max-len */
        expect(() => {
            new StorageController();
        }).toThrow('Invalid string passed through window.StorageController');

        window.StorageController = 'W10=';

        expect(() => {
            new StorageController();
        }).toThrow('Invalid string passed through window.StorageController');

        window.StorageController = 'e30=';

        expect(() => {
            new StorageController();
        }).not.toThrow('Invalid string passed through window.StorageController');

        delete window.StorageController;

        expect(() => {
            new StorageController();
        }).not.toThrow('Invalid string passed through window.StorageController');
        /* eslint-enable max-len */
    });

    it('should prepopulate', (done) => {
        window.StorageController = btoa(JSON.stringify({
            memory: {
                key1: 1,
                key2: 2
            },
            local: {
                key1: 3,
                key2: 4
            },
            session: {
                key1: 5,
                key2: 6
            }
        }));

        const spy = jest.fn();

        class StorageControllerStub extends StorageController {
            populate(...args) {
                spy.apply(spy, args);
                super.populate.apply(this, args);
            }
        }

        new StorageControllerStub();

        setTimeout(() => {
            try {
                expect(spy.mock.calls.length).toEqual(6);
                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should not update the freshness on prepopulate', () => {
        window.StorageController = btoa(JSON.stringify({
            memory: {
                key1: 1,
                key2: 2
            },
            local: {
                key1: 3,
                key2: 4
            },
            session: {
                key1: 5,
                key2: 6
            }
        }));

        const storage = new StorageController();

        expect(storage.freshness('memory', 'key1')).toEqual(0);
        expect(storage.freshness('local', 'key1')).toEqual(0);
        expect(storage.freshness('session', 'key1')).toEqual(0);
    });

    it('should update the freshness on populate', () => {
        window.StorageController = btoa(JSON.stringify({
            memory: {
                key1: 1,
                key2: 2
            },
            local: {
                key1: 3,
                key2: 4
            },
            session: {
                key1: 5,
                key2: 6
            }
        }));

        const storage = new StorageController(),
            now = Date.now();

        storage.populate('memory', 'key1', 20, 5);
        storage.populate('local', 'key1', 20, 5);
        storage.populate('session', 'key1', 20, 5);

        expect(Math.abs(storage.freshness('memory', 'key1') - now))
            .toBeLessThanOrEqual(10);

        expect(Math.abs(storage.freshness('local', 'key1') - now))
            .toBeLessThanOrEqual(10);

        expect(Math.abs(storage.freshness('session', 'key1') - now))
            .toBeLessThanOrEqual(10);
    });

    it('should inherit freshness', (done) => {
        const storage = new StorageController(),
            now = Date.now();

        storage.populate('memory', 'key1', 20, 5);
        storage.populate('memory', 'key1', false, 5);

        setTimeout(() => {
            try {
                expect(Math.abs(storage.freshness('memory', 'key1') - now))
                    .toBeLessThanOrEqual(5);

                setTimeout(() => {
                    try {
                        expect(
                            Math.abs(storage.freshness('memory', 'key1') - now)
                        )
                            .toBeLessThanOrEqual(5);
                        done();
                    } catch (e) {
                        done(e);
                    }
                }, 25);
            } catch (e) {
                done(e);
            }
        }, 15);
    });

    it('should remove stuff when asked to', () => {
        const storage = new StorageController();

        storage.populate('memory', 'key1', 20, 5);
        storage.populate('local', 'key1', 20, 5);
        storage.populate('session', 'key1', 20, 5);

        storage.remove('memory', 'key1');
        storage.remove('memory', 'key2');
        storage.remove('local', 'key1');
        storage.remove('session', 'key1');

        expect(storage.freshness('memory', 'key1')).toEqual(0);
        expect(storage.freshness('memory', 'key2')).toEqual(0);
        expect(storage.freshness('local', 'key1')).toEqual(0);
        expect(storage.freshness('session', 'key1')).toEqual(0);

        expect(Object.keys(storage.get('memory', 'key1')).length).toEqual(0);
        expect(Object.keys(storage.get('memory', 'key2')).length).toEqual(0);
        expect(Object.keys(storage.get('local', 'key1')).length).toEqual(0);
        expect(Object.keys(storage.get('session', 'key1')).length).toEqual(0);
    });

    it('should prune old stuff', (done) => {
        const spy = jest.fn();

        class StorageControllerStub extends StorageController {
            remove(...args) {
                spy.apply(spy, args);
                super.remove.apply(this, args);
            }
        }

        const storage = new StorageControllerStub();

        storage.populate('memory', 'key1', -15, 5);
        storage.populate('local', 'key1', -15, 5);
        storage.populate('session', 'key1', -15, 5);

        storage.populate('memory', 'key2', 20, 5);
        storage.populate('local', 'key2', 20, 5);
        storage.populate('session', 'key2', 20, 5);

        storage._pruneCache(() => {
            try {
                expect(Object.keys(storage.get('memory', 'key1')).length)
                    .toEqual(0);
                expect(Object.keys(storage.get('local', 'key1')).length)
                    .toEqual(0);
                expect(Object.keys(storage.get('session', 'key1')).length)
                    .toEqual(0);

                expect(storage.get('memory', 'key2')).toEqual(5);
                expect(storage.get('local', 'key2')).toEqual(5);
                expect(storage.get('session', 'key2')).toEqual(5);

                expect(spy.mock.calls.length).toEqual(3);
                done();
            } catch (e) {
                done(e);
            }
        });
    });

    it('should serialize', (done) => {
        window.StorageController = btoa(JSON.stringify({
            memory: {
                key1: 1,
                key2: 2
            },
            local: {
                key1: 3,
                key2: 4
            },
            session: {
                key1: 5,
                key2: 6
            }
        }));

        const storage = new StorageController();

        setTimeout(() => {
            try {
                const out = storage._out();

                expect(out).toEqual(atob(window.StorageController));
                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should serialize when empty', () => {
        const storage = new StorageController(),
            out = storage._out();

        expect(out).toEqual(JSON.stringify({
            memory: {},
            local: {},
            session: {}
        }));
    });

    it('should make a super cool string for the server', () => {
        const storage = new StorageController(),
            out = storage.out();

        expect(out).toEqual('window.StorageController = \"eyJtZW1vcnkiOnt9LCJsb2NhbCI6e30sInNlc3Npb24iOnt9fQ==\";'); // eslint-disable-line max-len
    });

    it('should yell when perverted', () => {
        const storage = new StorageController();

        /* eslint-disable max-len */
        expect(() => {
            storage.populate('beans', 'yolo', 150, 'hashtag');
        }).toThrow('Invalid storage mechanism sent to StorageController.populate');
        expect(() => {
            storage.register('beans', 'yolo', () => {});
        }).toThrow('Invalid storage mechanism sent to StorageController.register');
        expect(() => {
            storage.get('beans', 'yolo');
        }).toThrow('Invalid storage mechanism sent to StorageController.get');
        expect(() => {
            storage.freshness('beans', 'yolo');
        }).toThrow('Invalid storage mechanism sent to StorageController.freshness');
        /* eslint-enable max-len */
    });

    it('should not cry about empty registrations', () => {
        const storage = new StorageController();

        storage.register('memory', 'key1');

        storage.populate('memory', 'key1', 150, 12);
    });

    it('should register multiple callbacks', () => {
        const storage = new StorageController(),
            spy1 = jest.fn(),
            spy2 = jest.fn();

        storage.register('memory', 'key1', spy1);
        storage.register('memory', 'key1', spy2);

        storage.populate('memory', 'key1', 150, 12);

        expect(spy1.mock.calls.length).toEqual(1);
        expect(spy2.mock.calls.length).toEqual(1);
        expect(spy1.mock.calls[0][0]).toEqual(12);
        expect(spy2.mock.calls[0][0]).toEqual(12);
    });

    it('should be able to unregister a callback', () => {
        const storage = new StorageController(),
            spy = jest.fn(),

            unregister = storage.register('memory', 'key', spy);

        storage.populate('memory', 'key', null, 'data');

        expect(spy.mock.calls.length).toEqual(1);

        unregister.remove();

        storage.populate('memory', 'key', null, 'more data');

        expect(spy.mock.calls.length).toEqual(1);

        expect(() => {
            storage._unregister(
                'memory',
                'not_a_key',
                () => {}
            );
        }).toThrow('Cannot unregister an unregistered event');
    });
});
