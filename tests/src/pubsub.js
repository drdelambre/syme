import {
	pub,
	sub,
	unsub,
	clear,
	channels
} from 'base/pubsub';

describe('Pubsub', function() {
	it('should publish to all direct subscribers', function(done) {
		const spy1 = sinon.spy(),
			spy2 = sinon.spy();

		sub('/sub/channel', spy1);
		sub('/sub/channel', spy2);

		pub('/sub/channel', 'beans');

		setTimeout(function() {
			try {
				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(1);
				done();
			} catch (e) {
				done(e);
			}
		}, 15);
	});

	it('should publish to wildcard channels', function(done) {
		const spy1 = sinon.spy(),
			spy2 = sinon.spy();

		sub('/sub/channel/1337', spy1);
		sub('/sub/:word?/1337', spy2);
		sub('/sub/channel/1337', 'not a function');

		pub('/sub/channel/1337', 'beans');
		pub('/sub/1337', 'beans');
		pub('/sub', 'beans');

		setTimeout(function() {
			try {
				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(2);
				done();
			} catch (e) {
				done(e);
			}
		}, 15);
	});

	it('should allow unsubing', function(done) {
		const spy1 = sinon.spy(),
			spy2 = sinon.spy();

		sub('/sub/channel', spy1);
		sub('/sub/channel', spy2);
		unsub('/sub/channel', spy1);
		unsub('/sub/channel/beans', spy1);

		pub('/sub/channel', 'beans');

		setTimeout(function() {
			try {
				expect(spy1.callCount).to.equal(0);
				expect(spy2.callCount).to.equal(1);
				done();
			} catch (e) {
				done(e);
			}
		}, 15);
	});

	it('should clear for tests', function(done) {
		const spy1 = sinon.spy();

		sub('/sub/channel', spy1);

		clear();

		pub('/sub/channel', 'beans');

		setTimeout(function() {
			try {
				expect(spy1.callCount).to.equal(0);
				done();
			} catch (e) {
				done(e);
			}
		}, 15);
	});

	it('should let you know what channels are listening', function() {
		const log = console.log;

		sinon.stub(console, 'log');

		sub('/sub/channel/1337', () => {});
		sub('/sub/:word/1337', () => {});
		sub('/subz/channel/1337', 'not a function');

		channels();

		expect(console.log.callCount).to.equal(1);
		expect(console.log.calledWith([
			'Subscribed Channels:',
			'/sub/:word/1337',
			'/sub/channel/1337'
		].join('\n\t'))).to.be.true;
	})
});
