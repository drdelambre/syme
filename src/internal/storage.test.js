import store from 'base/internal/storage';
import {
	testForLocalStorage,
	testForSessionStorage
} from 'base/internal/storage';

describe('unifying storage interface', function() {
	it('should generate something for everything', function() {
		expect(store.hasOwnProperty('memory')).to.be.true;
		expect(store.hasOwnProperty('session')).to.be.true;
		expect(store.hasOwnProperty('local')).to.be.true;
	});

	it('should match the system', function() {
		expect(testForSessionStorage()).to.equal(typeof window.sessionStorage !== 'undefined')
		expect(testForLocalStorage()).to.equal(typeof window.localStorage !== 'undefined')
	});

	it('should set items', function() {
		store.memory.set('beans', 'yolo');
		store.session.set('beans', 'yolo1');
		store.local.set('beans', 'yolo2');

		expect(store.memory.get('beans')).to.equal('yolo');
		expect(store.session.get('beans')).to.equal('yolo1');
		expect(store.local.get('beans')).to.equal('yolo2');
	});

	it('should clear items', function() {
		store.memory.set('beans', 'yolo');
		store.session.set('beans', 'yolo1');
		store.local.set('beans', 'yolo2');

		store.memory.set('beans1', 'yolo5');
		store.session.set('beans1', 'yolo51');
		store.local.set('beans1', 'yolo52');

		store.memory.clear();
		store.session.clear();
		store.local.clear();

		expect(store.memory.get('beans')).to.not.exist;
		expect(store.session.get('beans')).to.not.exist;
		expect(store.local.get('beans')).to.not.exist;

		expect(store.memory.get('beans1')).to.not.exist;
		expect(store.session.get('beans1')).to.not.exist;
		expect(store.local.get('beans1')).to.not.exist;
	});
});
