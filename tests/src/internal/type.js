import type from 'base/internal/type.js';

describe('type checker', function() {
	it('should check an array', function() {
		expect(type([])).to.equal('array');
		expect(type([], 'array')).to.be.true;
		expect(type(12, 'array')).to.be.false;
		expect(type([], 'array,number')).to.be.true;
		expect(type(12, 'array,number')).to.be.true;
	});

	it('should match objects', function() {
		expect(type({})).to.equal('object');
		expect(type({}, 'object')).to.be.true;
		expect(type([], 'object')).to.be.false;
	});

	it('should match a date', function() {
		expect(type(new Date())).to.equal('date');
		expect(type(new Date(), 'date')).to.be.true;
		expect(type({}, 'date')).to.be.false;
	});

	it('should match null and undefined', function() {
		expect(type(null)).to.equal('null');
		expect(type(null, 'null')).to.be.true;
		expect(type(undefined)).to.equal('undefined');
		expect(type(undefined, 'undefined')).to.be.true;
	});

	it('should know dom nodes', function() {
		var div = document.createElement('div');
		div.innerHTML = "beans";

		expect(type(window)).to.equal('node');
		expect(type(window, 'node')).to.be.true;
		expect(type(document, 'node')).to.be.true;

		expect(type(div, 'node')).to.be.true;

		expect(type(div.childNodes[0], 'node')).to.be.false;
		expect(type(div.childNodes[0], 'textnode')).to.be.true;
	});
});
