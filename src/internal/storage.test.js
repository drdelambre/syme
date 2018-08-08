import store from 'base/internal/storage';
import {
    testForLocalStorage,
    testForSessionStorage
} from 'base/internal/storage';

describe('unifying storage interface', () => {
    it('should generate something for everything', () => {
        expect(store.hasOwnProperty('memory')).toBeTruthy();
        expect(store.hasOwnProperty('session')).toBeTruthy();
        expect(store.hasOwnProperty('local')).toBeTruthy();
    });

    it('should match the system', () => {
        expect(testForSessionStorage())
            .toEqual(typeof window.sessionStorage !== 'undefined');
        expect(testForLocalStorage())
            .toEqual(typeof window.localStorage !== 'undefined');
    });

    it('should set items', () => {
        store.memory.set('beans', 'yolo');
        store.session.set('beans', 'yolo1');
        store.local.set('beans', 'yolo2');

        expect(store.memory.get('beans')).toEqual('yolo');
        expect(store.session.get('beans')).toEqual('yolo1');
        expect(store.local.get('beans')).toEqual('yolo2');
    });

    it('should clear items', () => {
        store.memory.set('beans', 'yolo');
        store.session.set('beans', 'yolo1');
        store.local.set('beans', 'yolo2');

        store.memory.set('beans1', 'yolo5');
        store.session.set('beans1', 'yolo51');
        store.local.set('beans1', 'yolo52');

        store.memory.clear();
        store.session.clear();
        store.local.clear();

        expect(store.memory.get('beans')).toBeFalsy();
        expect(store.session.get('beans')).toBeFalsy();
        expect(store.local.get('beans')).toBeFalsy();

        expect(store.memory.get('beans1')).toBeFalsy();
        expect(store.session.get('beans1')).toBeFalsy();
        expect(store.local.get('beans1')).toBeFalsy();
    });
});
