import Cache from 'base/cache';

let cacheNum = 0;

describe('the cache system', function() {
	describe('interface', function() {
		it('should default the channel to memory', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						expiration: 1000
					});
				}
			}

			const cache = new MyCache();

			expect(cache.channel).to.equal('memory');
		});

		it('should default the expiration to 0.5s', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++)
					});
				}
			}

			const cache = new MyCache();

			expect(cache.expiration).to.equal(500);
		});

		it('should inherit the classname as the key if not set', function() {
			class MyCache extends Cache {
			}

			const cache = new MyCache();

			expect(cache.key).to.equal('MyCache');
		});

		it('should not allow giberish in the channel', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						channel: 'giberish',
						expiration: 1000
					});
				}
			}

			expect(function() {
				try {
					new MyCache();
				} catch(e) {
					throw e;
				}
			}).to.throw('Invalid storage mechanism sent to MyCache.channel');
		});

		it('should only allow integers in the expiration', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						expiration: 'beans'
					});
				}
			}

			expect(function() {
				try {
					new MyCache();
				} catch(e) {
					throw e;
				}
			}).to.throw('Invalid expiration time set for MyCache.expiration');
		});

		it('should keep cached as read-only', function() {
			class MyCache extends Cache {}

			const cache = new MyCache();

			expect(function() {
				cache.cached = 'beans';
			}).to.throw('cached is a read only property');
		});
	});

	describe('memory cache', function() {
		it('should populate', function() {
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

			expect(cache.cached).to.be.false;

			cache.populate({
				things: true,
				yolo: 'beans'
			});

			expect(cache.cached).to.not.be.false;
			expect(cache.cached.things).to.be.true;
			expect(cache.cached.yolo).to.equal('beans');
		});

		it('should notify watchers if populated', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						channel: 'memory',
						expiration: 1000
					});
				}
			}

			const spy = sinon.spy(),
				cache = new MyCache();

			cache.watch(spy);

			expect(spy.callCount).to.equal(0);

			cache.populate({
				hashtag: 'yolo'
			});

			expect(spy.callCount).to.equal(1);

			expect(spy.args[0][0].hashtag).to.equal('yolo');
		})
	});

	describe('sessionStorage cache', function() {
		it('should populate', function() {
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

			expect(cache.cached).to.be.false;

			cache.populate({
				things: true,
				yolo: 'beans'
			});

			expect(cache.cached).to.not.be.false;
			expect(cache.cached.things).to.be.true;
			expect(cache.cached.yolo).to.equal('beans');
		});

		it('should notify watchers if populated', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						channel: 'session',
						expiration: 1000
					});
				}
			}

			const spy = sinon.spy(),
				cache = new MyCache();

			cache.watch(spy);

			expect(spy.callCount).to.equal(0);

			cache.populate({
				hashtag: 'yolo'
			});

			expect(spy.callCount).to.equal(1);

			expect(spy.args[0][0].hashtag).to.equal('yolo');
		})
	});

	describe('localStorage cache', function() {
		it('should populate', function() {
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

			expect(cache.cached).to.be.false;

			cache.populate({
				things: true,
				yolo: 'beans'
			});

			expect(cache.cached).to.not.be.false;
			expect(cache.cached.things).to.be.true;
			expect(cache.cached.yolo).to.equal('beans');
		});

		it('should notify watchers if populated', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						channel: 'local',
						expiration: 1000
					});
				}
			}

			const spy = sinon.spy(),
				cache = new MyCache();

			cache.watch(spy);

			expect(spy.callCount).to.equal(0);

			cache.populate({
				hashtag: 'yolo'
			});

			expect(spy.callCount).to.equal(1);

			expect(spy.args[0][0].hashtag).to.equal('yolo');
		});

		it('should clear and tell people', function() {
			class MyCache extends Cache {
				constructor() {
					super({
						key: 'test-cache-' + (cacheNum++),
						channel: 'local',
						expiration: 1000
					});
				}
			}

			const spy = sinon.spy(),
				cache = new MyCache();

			cache.populate({
				things: true,
				yolo: 'beans'
			});

			cache.watch(spy);

			expect(spy.callCount).to.equal(0);

			cache.clear();

			expect(cache.cached).to.be.false;
			expect(spy.callCount).to.equal(1);
			expect(spy.args[0][0]).to.be.false;
		});
	});
});
