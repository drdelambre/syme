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

            expect(cache.cached).toBeInstanceOf(MyModel);
        });

        it('should utilize arrays of models', () => {
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
                        model: [ MyModel ]
                    });
                }
            }

            const cache = new MyCache(),
                models = [
                    new MyModel({
                        id: 15,
                        name: 'hashtag'
                    }),
                    new MyModel({
                        id: 34,
                        name: 'beans'
                    })
                ],
                spy = jest.fn();

            cache.watch(spy);

            cache.populate(models);

            expect(Object.prototype.toString.call(spy.mock.calls[0][0]))
                .toEqual('[object Array]');
            expect(spy.mock.calls[0][0][0])
                .toBeInstanceOf(MyModel);
            expect(spy.mock.calls[0][0][1])
                .toBeInstanceOf(MyModel);

            cache.populate([ {
                id: 12,
                name: 'pinto'
            }, {
                id: 64,
                name: 'yolo'
            } ]);

            expect(Object.prototype.toString.call(spy.mock.calls[1][0]))
                .toEqual('[object Array]');
            expect(spy.mock.calls[1][0][0])
                .toBeInstanceOf(MyModel);
            expect(spy.mock.calls[1][0][1])
                .toBeInstanceOf(MyModel);
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

            expect(cache.cached).toBeFalsy();

            cache.populate({
                things: true,
                yolo: 'beans'
            });

            expect(cache.cached).toBeTruthy();
            expect(cache.cached.things).toBeTruthy();
            expect(cache.cached.yolo).toEqual('beans');
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

            expect(cache.cached).toBeFalsy();

            cache.populate({
                things: true,
                yolo: 'beans'
            });

            expect(cache.cached).toBeTruthy();
            expect(cache.cached.things).toBeTruthy();
            expect(cache.cached.yolo).toEqual('beans');
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

            expect(cache.cached).toBeFalsy();

            cache.populate({
                things: true,
                yolo: 'beans'
            });

            expect(cache.cached).toBeTruthy();
            expect(cache.cached.things).toBeTruthy();
            expect(cache.cached.yolo).toEqual('beans');
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

            expect(cache.cached).toBeFalsy();
            expect(spy.mock.calls.length).toEqual(1);
            expect(spy.mock.calls[0][0]).toBeFalsy();
        });
    });
});
