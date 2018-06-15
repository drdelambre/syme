import ThrottledObserver from 'base/internal/throttled-observer';

describe('Change throttle', function() {
    it('should fire to subscribers', function(done) {
        var throttle = ThrottledObserver(),
            spy1 = jest.fn(),
            spy2 = jest.fn();

        throttle.onFire('change', spy1);
        throttle.onFire('change', spy2);

        throttle.add('change', 'beans');

        setTimeout(function() {
            try {
                expect(spy1.mock.calls.length).toEqual(1);
                expect(spy2.mock.calls.length).toEqual(1);
                expect(spy1.mock.calls[0][0]).toEqual('beans');

                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should group changes for subscribers', function(done) {
        var throttle = ThrottledObserver(),
            spy = jest.fn();

        throttle.onFire('change', spy);
        throttle.add('change', 'beans');
        throttle.add('change', 'pinto');
        throttle.add('change', 'bread');

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);
                expect(spy.mock.calls[0][0]).toEqual('bread');

                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should only notify its own channel', function(done) {
        var throttle = ThrottledObserver(),
            spy = jest.fn();

        throttle.onFire('update', spy);
        throttle.onFire('update', null);

        throttle.add('change', 'beans');
        throttle.add('change', 'pinto');
        throttle.add('change', 'bread');

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(0);

                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should accept a wildcard channel', function(done) {
        var throttle = ThrottledObserver(),
            spy = jest.fn();

        throttle.onFire('*', spy);

        throttle.add('update', 'beans');
        throttle.add('update', 'pinto');

        throttle.add('change', 'beans');
        throttle.add('change', 'pinto');
        throttle.add('change', 'bread');

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(1);
                expect(spy.mock.calls[0][0].update).toEqual('pinto');
                expect(spy.mock.calls[0][0].change).toEqual('bread');

                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });

    it('should not fire empty queues', function(done) {
        var throttle = ThrottledObserver(),
            spy = jest.fn();

        throttle.onFire('*', spy);
        throttle.fire();

        setTimeout(function() {
            try {
                expect(spy.mock.calls.length).toEqual(0);

                done();
            } catch (e) {
                done(e);
            }
        }, 50);
    });
});
