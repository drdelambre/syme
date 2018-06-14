import store from 'base/internal/storage';
import {
    testForLocalStorage,
    testForSessionStorage
} from 'base/internal/storage';

describe('unifying storage interface', function() {
    it('should generate something for everything', function() {
        expect(store.hasOwnProperty('memory')).toBeTruthy();
        expect(store.hasOwnProperty('session')).toBeTruthy();
        expect(store.hasOwnProperty('local')).toBeTruthy();
    });

    it('should match the system', function() {
        expect(testForSessionStorage())
            .toEqual(typeof window.sessionStorage !== 'undefined');
        expect(testForLocalStorage())
            .toEqual(typeof window.localStorage !== 'undefined');
    });

    it('should set items', function() {
        store.memory.set('beans', 'yolo');
        store.session.set('beans', 'yolo1');
        store.local.set('beans', 'yolo2');

        expect(store.memory.get('beans')).toEqual('yolo');
        expect(store.session.get('beans')).toEqual('yolo1');
        expect(store.local.get('beans')).toEqual('yolo2');
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

        expect(store.memory.get('beans')).not.toBeDefined();
        expect(store.session.get('beans')).not.toBeDefined();
        expect(store.local.get('beans')).not.toBeDefined();

        expect(store.memory.get('beans1')).not.toBeDefined();
        expect(store.session.get('beans1')).not.toBeDefined();
        expect(store.local.get('beans1')).not.toBeDefined();
    });
});
