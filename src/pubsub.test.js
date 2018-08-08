import {
    pub,
    sub,
    unsub,
    clear,
    channels
} from 'base/pubsub';

describe('Pubsub', () => {
    it('should publish to all direct subscribers', (done) => {
        const spy1 = jest.fn(),
            spy2 = jest.fn();

        sub('/sub/channel', spy1);
        sub('/sub/channel', spy2);

        pub('/sub/channel', 'beans');

        setTimeout(() => {
            try {
                expect(spy1.mock.calls.length).toEqual(1);
                expect(spy2.mock.calls.length).toEqual(1);
                done();
            } catch (e) {
                done(e);
            }
        }, 15);
    });

    it('should publish to wildcard channels', (done) => {
        const spy1 = jest.fn(),
            spy2 = jest.fn();

        sub('/sub/channel/1337', spy1);
        sub('/sub/:word?/1337', spy2);
        sub('/sub/channel/1337', 'not a function');

        pub('/sub/channel/1337', 'beans');
        pub('/sub/1337', 'beans');
        pub('/sub', 'beans');

        setTimeout(() => {
            try {
                expect(spy1.mock.calls.length).toEqual(1);
                expect(spy2.mock.calls.length).toEqual(2);
                done();
            } catch (e) {
                done(e);
            }
        }, 15);
    });

    it('should allow unsubing', (done) => {
        const spy1 = jest.fn(),
            spy2 = jest.fn();

        sub('/sub/channel', spy1);
        sub('/sub/channel', spy2);
        unsub('/sub/channel', spy1);
        unsub('/sub/channel/beans', spy1);

        pub('/sub/channel', 'beans');

        setTimeout(() => {
            try {
                expect(spy1.mock.calls.length).toEqual(0);
                expect(spy2.mock.calls.length).toEqual(1);
                done();
            } catch (e) {
                done(e);
            }
        }, 15);
    });

    it('should clear for tests', (done) => {
        const spy1 = jest.fn();

        sub('/sub/channel', spy1);

        clear();

        pub('/sub/channel', 'beans');

        setTimeout(() => {
            try {
                expect(spy1.mock.calls.length).toEqual(0);
                done();
            } catch (e) {
                done(e);
            }
        }, 15);
    });

    it('should let you know what channels are listening', () => {
        jest.spyOn(console, 'log');

        sub('/sub/channel/1337', () => {});
        sub('/sub/:word/1337', () => {});
        sub('/subz/channel/1337', 'not a function');

        channels();

        /* eslint-disable no-console */
        expect(console.log.mock.calls.length).toEqual(1);
        expect(console.log.mock.calls[0][0]).toEqual([
            'Subscribed Channels:',
            '/sub/:word/1337',
            '/sub/channel/1337'
        ].join('\n\t'));
        /* eslint-enable no-console */
    });
});
