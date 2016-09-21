import ThrottledObserver from 'base/internal/throttled-observer';

describe('Change throttle', function() {
	it('should fire to subscribers', function(done) {
		var throttle = ThrottledObserver(),
			spy1 = sinon.spy(),
			spy2 = sinon.spy();

		throttle.onFire('change', spy1);
		throttle.onFire('change', spy2);

		throttle.add('change', 'beans');

		setTimeout(function() {
			try {
				expect(spy1.callCount).to.equal(1);
				expect(spy2.callCount).to.equal(1);
				expect(spy1.args[0][0]).to.equal('beans');

				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});

	it('should group changes for subscribers', function(done) {
		var throttle = ThrottledObserver(),
			spy = sinon.spy();

		throttle.onFire('change', spy);
		throttle.add('change', 'beans');
		throttle.add('change', 'pinto');
		throttle.add('change', 'bread');

		setTimeout(function() {
			try {
				expect(spy.callCount).to.equal(1);
				expect(spy.args[0][0]).to.equal('bread');

				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});

	it('should only notify its own channel', function(done) {
		var throttle = ThrottledObserver(),
			spy = sinon.spy();

		throttle.onFire('update', spy);
		throttle.onFire('update', null);

		throttle.add('change', 'beans');
		throttle.add('change', 'pinto');
		throttle.add('change', 'bread');

		setTimeout(function() {
			try {
				expect(spy.called).to.be.false;

				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});

	it('should accept a wildcard channel', function(done) {
		var throttle = ThrottledObserver(),
			spy = sinon.spy();

		throttle.onFire('*', spy);

		throttle.add('update', 'beans');
		throttle.add('update', 'pinto');

		throttle.add('change', 'beans');
		throttle.add('change', 'pinto');
		throttle.add('change', 'bread');

		setTimeout(function() {
			try {
				expect(spy.callCount).to.equal(1);
				expect(spy.args[0][0].update).to.equal('pinto');
				expect(spy.args[0][0].change).to.equal('bread');

				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});

	it('should not fire empty queues', function(done) {
		var throttle = ThrottledObserver(),
			spy = sinon.spy();

		throttle.onFire('*', spy);
		throttle.fire();

		setTimeout(function() {
			try {
				expect(spy.callCount).to.equal(0);

				done();
			} catch (e) {
				done(e);
			}
		}, 50);
	});
});
