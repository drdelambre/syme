import type from 'base/internal/type.js';

describe('type checker', function() {
    it('should check an array', function() {
        expect(type([])).toEqual('array');
        expect(type([], 'array')).toBeTruthy();
        expect(type(12, 'array')).toBeFalsy();
        expect(type([], 'array,number')).toBeTruthy();
        expect(type(12, 'array,number')).toBeTruthy();
    });

    it('should match objects', function() {
        expect(type({})).toEqual('object');
        expect(type({}, 'object')).toBeTruthy();
        expect(type([], 'object')).toBeFalsy();
    });

    it('should match a date', function() {
        expect(type(new Date())).toEqual('date');
        expect(type(new Date(), 'date')).toBeTruthy();
        expect(type({}, 'date')).toBeFalsy();
    });

    it('should match null and undefined', function() {
        expect(type(null)).toEqual('null');
        expect(type(null, 'null')).toBeTruthy();
        expect(type(undefined)).toEqual('undefined');
        expect(type(undefined, 'undefined')).toBeTruthy();
    });

    it('should know dom nodes', function() {
        var div = document.createElement('div');

        div.innerHTML = 'beans';

        expect(type(window)).toEqual('node');
        expect(type(window, 'node')).toBeTruthy();

        expect(type(div, 'node')).toBeTruthy();

        expect(type(div.childNodes[0], 'node')).toBeFalsy();
        expect(type(div.childNodes[0], 'textnode')).toBeTruthy();
    });
});
