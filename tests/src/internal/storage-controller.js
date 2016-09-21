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

		window.StorageController = '[]';

		expect(function() {
			new StorageController();
		}).to.throw('Invalid string passed through window.StorageController');

		window.StorageController = '{}';

		expect(function() {
			new StorageController();
		}).to.not.throw('Invalid string passed through window.StorageController');

		delete window.StorageController;

		expect(function() {
			new StorageController();
		}).to.not.throw('Invalid string passed through window.StorageController');
	});

	it ('should prepopulate', function() {
		window.StorageController = JSON.stringify({
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
		});

		const spy = sinon.spy();

		class StorageControllerStub extends StorageController {
			populate(...args) {
				spy.apply(spy, args);
				super.populate.apply(this, args);
			}
		}

		const storage = new StorageControllerStub();

		expect(spy.callCount).to.equal(6);
	});

	it ('should not update the freshness on prepopulate', function() {
		window.StorageController = JSON.stringify({
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
		});

		const storage = new StorageController();

		expect(storage.freshness('memory', 'key1')).to.equal(0);
		expect(storage.freshness('local', 'key1')).to.equal(0);
		expect(storage.freshness('session', 'key1')).to.equal(0);
	});

	it ('should update the freshness on populate', function() {
		window.StorageController = JSON.stringify({
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
		});

		const storage = new StorageController(),
			now = Date.now();

		storage.populate('memory', 'key1', 5);
		storage.populate('local', 'key1', 5);
		storage.populate('session', 'key1', 5);

		expect(storage.freshness('memory', 'key1') - now).to.be.below(10)
			.and.to.be.above(-10);
		expect(storage.freshness('local', 'key1') - now).to.be.below(10)
			.and.to.be.above(-10);
		expect(storage.freshness('session', 'key1') - now).to.be.below(10)
			.and.to.be.above(-10);
	});

	it ('should serialize', function() {
		window.StorageController = JSON.stringify({
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
		});

		const storage = new StorageController(),
			out = storage._out();

		expect(out).to.equal(window.StorageController);
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

		expect(out).to.equal('window.StorageController = \'{"memory":{},"local":{},"session":{}}\';');
	});

	it ('should yell when perverted', function() {
		const storage = new StorageController();

		expect(function() {
			storage.populate('beans', 'yolo', 'hashtag');
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

		storage.populate('memory', 'key1', 12);
	});

	it('should register multiple callbacks', function() {
		const storage = new StorageController(),
			spy1 = sinon.spy(),
			spy2 = sinon.spy();

		storage.register('memory', 'key1', spy1);
		storage.register('memory', 'key1', spy2);

		storage.populate('memory', 'key1', 12);

		expect(spy1.callCount).to.equal(1);
		expect(spy2.callCount).to.equal(1);
		expect(spy1.args[0][0]).to.equal(12);
		expect(spy2.args[0][0]).to.equal(12);
	});

	it('should populate on register', function() {
		const storage = new StorageController(),
			spy = sinon.spy();

		storage.populate('memory', 'key1', 12);
		storage.register('memory', 'key1', spy);

		expect(spy.callCount).to.equal(1);
		expect(spy.args[0][0]).to.equal(12);

		storage.populate('memory', 'key1', 'beans');

		expect(spy.callCount).to.equal(2);
		expect(spy.args[1][0]).to.equal('beans');
	});
});
