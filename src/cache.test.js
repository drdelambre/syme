import Cache from 'base/cache';
import Model from 'base/model';

let cacheNum = 0;

describe('the cache system', () => {
    describe('interface', () => {
        it('should default the channel to memory', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        expiration: 1000
                    });
                }
            }

            const cache = new MyCache();

            expect(cache.channel).toEqual('memory');
        });

        it('should default the expiration to 0.5s', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++)
                    });
                }
            }

            const cache = new MyCache();

            expect(cache.expiration).toEqual(500);
        });

        it('should inherit the classname as the key if not set', () => {
            class MyCache extends Cache {
            }

            const cache = new MyCache();

            expect(cache.key).toEqual(cache.constructor.name);
        });

        it('should not allow giberish in the channel', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'giberish',
                        expiration: 1000
                    });
                }
            }

            expect(() => {
                try {
                    new MyCache();
                } catch (e) {
                    throw e;
                }
            }).toThrow('Invalid storage mechanism sent to MyCache.channel');
        });

        it('should only allow integers in the expiration', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        expiration: 'beans'
                    });
                }
            }

            expect(() => {
                try {
                    new MyCache();
                } catch (e) {
                    throw e;
                }
            }).toThrow('Invalid expiration time set for MyCache.expiration');
        });

        it('should keep cached as read-only', () => {
            class MyCache extends Cache {}

            const cache = new MyCache();

            expect(() => {
                cache.cached = 'beans';
            }).toThrow('cached is a read only property');
        });

        it('should utilize models', () => {
            class MyModel extends Model {
                constructor(data) {
                    super({
                        id: 12,
                        name: 'yolo'
                    });

                    this.fill(data);
                }
            }

            class MyCache extends Cache {
                constructor() {
                    super({
                        model: MyModel
                    });
                }
            }

            const cache = new MyCache(),
                model = new MyModel({
                    id: 23,
                    name: 'jordan'
                }),
                spy = jest.fn();

            cache.watch(spy);

            cache.populate({
                id: 34,
                name: 'hashtag'
            });

            expect(spy.mock.calls[0][0]).toBeInstanceOf(MyModel);

            cache.populate(model);

            return expect(cache.cached).resolves.toBeInstanceOf(MyModel);
        });
    });

    describe('memory cache', () => {
        it('should populate', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });
                }
            }

            const cache = new MyCache();

            return cache.cached.then((data) => {
                expect(data).toBeFalsy();

                cache.populate({
                    things: true,
                    yolo: 'beans'
                });

                return cache.cached;
            }).then((data) => {
                expect(data).toBeTruthy();
                expect(data.things).toBeTruthy();
                expect(data.yolo).toEqual('beans');
            });
        });

        it('should notify watchers if populated', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });
                }
            }

            const spy = jest.fn(),
                cache = new MyCache();

            cache.watch(spy);

            expect(spy.mock.calls.length).toEqual(0);

            cache.populate({
                hashtag: 'yolo'
            });

            expect(spy.mock.calls.length).toEqual(1);

            expect(spy.mock.calls[0][0].hashtag).toEqual('yolo');
        });

        it('should not notify unregistered watchers', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });
                }
            }

            const spy = jest.fn(),
                cache = new MyCache(),
                unwatch = cache.watch(spy);

            cache.populate({
                data: 'test'
            });

            expect(spy.mock.calls.length).toEqual(1);
            unwatch.remove();

            cache.populate({
                data: 'more test'
            });

            expect(spy.mock.calls.length).toEqual(1);
        });
    });

    describe('sessionStorage cache', () => {
        it('should populate', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'session',
                        expiration: 1000
                    });
                }
            }

            const cache = new MyCache();

            return cache.cached.then((data) => {
                expect(data).toBeFalsy();

                cache.populate({
                    things: true,
                    yolo: 'beans'
                });

                return cache.cached;
            }).then((data) => {
                expect(data).toBeTruthy();
                expect(data.things).toBeTruthy();
                expect(data.yolo).toEqual('beans');
            });
        });

        it('should notify watchers if populated', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'session',
                        expiration: 1000
                    });
                }
            }

            const spy = jest.fn(),
                cache = new MyCache();

            cache.watch(spy);

            expect(spy.mock.calls.length).toEqual(0);

            cache.populate({
                hashtag: 'yolo'
            });

            expect(spy.mock.calls.length).toEqual(1);

            expect(spy.mock.calls[0][0].hashtag).toEqual('yolo');
        });
    });

    describe('localStorage cache', () => {
        it('should populate', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'local',
                        expiration: 1000
                    });
                }
            }

            const cache = new MyCache();

            return cache.cached.then((data) => {
                expect(data).toBeFalsy();

                cache.populate({
                    things: true,
                    yolo: 'beans'
                });

                return cache.cached;
            }).then((data) => {
                expect(data).toBeTruthy();
                expect(data.things).toBeTruthy();
                expect(data.yolo).toEqual('beans');
            });
        });

        it('should notify watchers if populated', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'local',
                        expiration: 1000
                    });
                }
            }

            const spy = jest.fn(),
                cache = new MyCache();

            cache.watch(spy);

            expect(spy.mock.calls.length).toEqual(0);

            cache.populate({
                hashtag: 'yolo'
            });

            expect(spy.mock.calls.length).toEqual(1);

            expect(spy.mock.calls[0][0].hashtag).toEqual('yolo');
        });

        it('should clear and tell people', () => {
            class MyCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'local',
                        expiration: 1000
                    });
                }
            }

            const spy = jest.fn(),
                cache = new MyCache();

            cache.populate({
                things: true,
                yolo: 'beans'
            });

            cache.watch(spy);

            expect(spy.mock.calls.length).toEqual(0);

            cache.clear();

            expect(spy.mock.calls.length).toEqual(1);
            expect(spy.mock.calls[0][0]).toBeFalsy();

            return cache.cached.then((data) => {
                expect(data).toBeFalsy();
            });
        });
    });

    describe('third party storage', () => {
        function createWorker(shared = true) {
            const obj = {
                postMessage: jest.fn()
                    .mockImplementation((data) => {
                        if (data.action === 'query') {
                            obj.addEventListener.mock.calls[0][1]({
                                data: {
                                    action: 'query',
                                    payload: {
                                        data: false,
                                        uuid: data.payload.uuid
                                    }
                                }
                            });
                        }
                    }),
                addEventListener: jest.fn()
            };

            if (!shared) {
                return obj;
            }

            return {
                port: obj
            };
        }

        it('should register a worker', () => {
            const worker = createWorker(true);

            class MySharedCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });

                    this.registerWorker(worker, true);
                }
            }

            new MySharedCache();

            expect(worker.port.postMessage.mock.calls.length).toEqual(1);
            expect(worker.port.postMessage.mock.calls[0][0].action)
                .toEqual('register');
        });

        it('should populate', () => {
            const worker = createWorker(true);

            class MySharedCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });

                    this.registerWorker(worker, true);
                }
            }

            const cache = new MySharedCache();

            return cache.cached.then((data) => {
                expect(data).toBeFalsy();

                cache.populate({
                    things: true,
                    yolo: 'beans'
                });

                expect(worker.port.postMessage.mock.calls.length).toEqual(3);
                expect(worker.port.postMessage.mock.calls[2][0].action)
                    .toEqual('update');
            });
        });

        it('should allow clearing', () => {
            const worker = createWorker(true);

            class MySharedCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });

                    this.registerWorker(worker, true);
                }
            }

            const cache = new MySharedCache();

            cache.clear();

            expect(worker.port.postMessage.mock.calls.length).toEqual(2);
            expect(worker.port.postMessage.mock.calls[1][0].action)
                .toEqual('remove');
        });

        it('should register callbacks', () => {
            const worker = createWorker(false);

            class MySharedCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });

                    this.registerWorker(worker, false);
                }
            }

            const cache = new MySharedCache(),
                spy = jest.fn();

            cache.watch(spy);

            worker.addEventListener.mock.calls[0][1]({
                data: {
                    action: 'update',
                    payload: {
                        channel: 'memory',
                        key: cache.key,
                        expiration: Date.now() + cache.expiration,
                        data: 'beans'
                    }
                }
            });

            expect(spy.mock.calls.length).toEqual(1);
            expect(spy.mock.calls[0][0]).toEqual('beans');
        });

        it('should ignore gibberish', () => {
            const worker = createWorker();

            class MySharedCache extends Cache {
                constructor() {
                    super({
                        key: 'test-cache-' + (cacheNum++),
                        channel: 'memory',
                        expiration: 1000
                    });

                    this.registerWorker(worker);
                }
            }

            const cache = new MySharedCache(),
                spy = jest.fn();

            cache.watch(spy);

            worker.port.addEventListener.mock.calls[0][1]({
                data: {
                    action: 'update',
                    payload: {
                        channel: 'local',
                        key: cache.key,
                        expiration: Date.now() + cache.expiration,
                        data: 'beans'
                    }
                }
            });

            expect(spy.mock.calls.length).toEqual(0);

            worker.port.addEventListener.mock.calls[0][1]({
                data: {
                    action: 'update',
                    payload: {
                        channel: 'memory',
                        key: 'nope',
                        expiration: Date.now() + cache.expiration,
                        data: 'beans'
                    }
                }
            });

            expect(spy.mock.calls.length).toEqual(0);

            cache.cached;
            worker.port.addEventListener.mock.calls[0][1]({
                data: {
                    action: 'query',
                    payload: {
                        data: 'beans',
                        uuid: 'hashtag_yolo'
                    }
                }
            });

            expect(spy.mock.calls.length).toEqual(0);

            worker.port.addEventListener.mock.calls[0][1]({
                data: {
                    action: 'nonsense'
                }
            });

            expect(spy.mock.calls.length).toEqual(0);
        });
    });
});
