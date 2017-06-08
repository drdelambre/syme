import { StorageController } from 'base/internal/storage-controller';
import store from 'base/internal/storage';

describe('Storage Controller', function() {
	beforeEach(function() {
		store.memory.clear();
		store.session.clear();
		store.local.clear();

		delete window.StorageController;
	});

	it ('should explode on jibber jabber', function() {
		window.StorageController = 'jibber jabber';

		expect(function() {
			new StorageController();
		}).to.throw('Invalid string passed through window.StorageController');

		window.StorageController = 'W10=';

		expect(function() {
			new StorageController();
		}).to.throw('Invalid string passed through window.StorageController');

		window.StorageController = 'e30=';

		expect(function() {
			new StorageController();
		}).to.not.throw('Invalid string passed through window.StorageController');

		delete window.StorageController;

		expect(function() {
			new StorageController();
		}).to.not.throw('Invalid string passed through window.StorageController');
	});

	it ('should prepopulate', function(done) {
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

		const spy = sinon.spy();

		class StorageControllerStub extends StorageController {
			populate(...args) {
				spy.apply(spy, args);
				super.populate.apply(this, args);
			}
		}

		const storage = new StorageControllerStub();

		setTimeout(() => {
			try {
				expect(spy.callCount).to.equal(6);
				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});

	it ('should not update the freshness on prepopulate', function() {
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

		expect(storage.freshness('memory', 'key1')).to.equal(0);
		expect(storage.freshness('local', 'key1')).to.equal(0);
		expect(storage.freshness('session', 'key1')).to.equal(0);
	});

	it ('should update the freshness on populate', function() {
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

		expect(storage.freshness('memory', 'key1') - now).to.be.below(10)
			.and.to.be.above(-10);
		expect(storage.freshness('local', 'key1') - now).to.be.below(10)
			.and.to.be.above(-10);
		expect(storage.freshness('session', 'key1') - now).to.be.below(10)
			.and.to.be.above(-10);
	});

	it ('should inherit freshness', function(done) {
		const storage = new StorageController(),
			now = Date.now();

		storage.populate('memory', 'key1', 20, 5);
		storage.populate('memory', 'key1', false, 5);

		setTimeout(() => {
			try {
				expect(storage.freshness('memory', 'key1') - now).to.be.below(5)
					.and.to.be.above(-5);

				setTimeout(() => {
					try {
						expect(storage.freshness('memory', 'key1') - now).to.equal(0)
						done();
					} catch(e) {
						done(e);
					}
				}, 25);
			} catch(e) {
				done(e);
			}
		}, 15);
	});

	it ('should remove stuff when asked to', function() {
		const storage = new StorageController();

		storage.populate('memory', 'key1', 20, 5);
		storage.populate('local', 'key1', 20, 5);
		storage.populate('session', 'key1', 20, 5);

		storage.remove('memory', 'key1');
		storage.remove('memory', 'key2');
		storage.remove('local', 'key1');
		storage.remove('session', 'key1');

		expect(storage.freshness('memory', 'key1')).to.equal(0);
		expect(storage.freshness('memory', 'key2')).to.equal(0);
		expect(storage.freshness('local', 'key1')).to.equal(0);
		expect(storage.freshness('session', 'key1')).to.equal(0);

		expect(Object.keys(storage.get('memory', 'key1')).length).to.equal(0);
		expect(Object.keys(storage.get('memory', 'key2')).length).to.equal(0);
		expect(Object.keys(storage.get('local', 'key1')).length).to.equal(0);
		expect(Object.keys(storage.get('session', 'key1')).length).to.equal(0);
	});

	it ('should prune old stuff', function(done) {
		const spy = sinon.spy();

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
				expect(Object.keys(storage.get('memory', 'key1')).length).to.equal(0);
				expect(Object.keys(storage.get('local', 'key1')).length).to.equal(0);
				expect(Object.keys(storage.get('session', 'key1')).length).to.equal(0);

				expect(storage.get('memory', 'key2')).to.equal(5);
				expect(storage.get('local', 'key2')).to.equal(5);
				expect(storage.get('session', 'key2')).to.equal(5);

				expect(spy.callCount).to.equal(3);
				done();
			} catch(e) {
				done(e);
			}
		})
	});

	it ('should serialize', function(done) {
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

		const storage = new StorageController()

		setTimeout(() => {
			try {
				const out = storage._out();

				expect(out).to.equal(atob(window.StorageController));
				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});

	it ('should serialize when empty', function() {
		const storage = new StorageController(),
			out = storage._out();

		expect(out).to.equal(JSON.stringify({
			memory: {},
			local: {},
			session: {}
		}));
	});

	it ('should make a super cool string for the server', function() {
		const storage = new StorageController(),
			out = storage.out();

		expect(out).to.equal('window.StorageController = \"eyJtZW1vcnkiOnt9LCJsb2NhbCI6e30sInNlc3Npb24iOnt9fQ==\";');
	});

	it ('should yell when perverted', function() {
		const storage = new StorageController();

		expect(function() {
			storage.populate('beans', 'yolo', 150, 'hashtag');
		}).to.throw('Invalid storage mechanism sent to StorageController.populate');
		expect(function() {
			storage.register('beans', 'yolo', function() {});
		}).to.throw('Invalid storage mechanism sent to StorageController.register');
		expect(function() {
			storage.get('beans', 'yolo');
		}).to.throw('Invalid storage mechanism sent to StorageController.get');
		expect(function() {
			storage.freshness('beans', 'yolo');
		}).to.throw('Invalid storage mechanism sent to StorageController.freshness');
	});

	it('should not cry about empty registrations', function() {
		const storage = new StorageController();

		storage.register('memory', 'key1');

		storage.populate('memory', 'key1', 150, 12);
	});

	it('should register multiple callbacks', function() {
		const storage = new StorageController(),
			spy1 = sinon.spy(),
			spy2 = sinon.spy();

		storage.register('memory', 'key1', spy1);
		storage.register('memory', 'key1', spy2);

		storage.populate('memory', 'key1', 150, 12);

		expect(spy1.callCount).to.equal(1);
		expect(spy2.callCount).to.equal(1);
		expect(spy1.args[0][0]).to.equal(12);
		expect(spy2.args[0][0]).to.equal(12);
	});

	it('should be able to unregister a callback', function() {
		const storage = new StorageController(),
			spy1 = sinon.spy(),
			spy2 = sinon.spy();

		const unregister1 = storage.register('memory', 'key1', spy1);
		const unregister2 = storage.register('memory', 'key1', spy2);
		storage.populate('memory', 'key1', null, 'data');

		expect(spy1.callCount).to.equal(1);
		expect(spy2.callCount).to.equal(1);

		unregister1();
		storage.populate('memory', 'key1', null, 'data');

		expect(spy1.callCount).to.equal(1);
		expect(spy2.callCount).to.equal(2);
	});
});
