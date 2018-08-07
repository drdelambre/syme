import Observer from 'base/internal/observer';

describe('Observer', () => {
    it('should fire to subscribers', () => {
        const observer = new Observer(),
            spy1 = jest.fn(),
            spy2 = jest.fn();

        observer(spy1);
        observer(spy2);

        observer.fire('beans');

        expect(spy1.mock.calls.length).toEqual(1);
        expect(spy2.mock.calls.length).toEqual(1);
    });

    it('should ignore non function callbacks', () => {
        const observer = new Observer();

        observer({});

        expect(() => { observer.fire('beans'); }).not.toThrow();
    });

    it('should allow unsubscribing', () => {
        const observer = new Observer(),
            spy1 = jest.fn(),
            spy2 = jest.fn(),
            ret = observer(spy1);

        observer(spy2);
        ret.remove();

        observer.fire('beans');

        expect(spy1.mock.calls.length).toEqual(0);
        expect(spy2.mock.calls.length).toEqual(1);
    });

    it('should forward whatever', () => {
        const observer = new Observer(),
            spy1 = jest.fn();

        observer(spy1);

        observer.fire('hash', 'tag', 'yolo');

        expect(spy1.mock.calls[0][0]).toEqual('hash');
        expect(spy1.mock.calls[0][1]).toEqual('tag');
        expect(spy1.mock.calls[0][2]).toEqual('yolo');

        observer.fire('totally', 'rad');

        expect(spy1.mock.calls[1][0]).toEqual('totally');
        expect(spy1.mock.calls[1][1]).toEqual('rad');
    });
});
