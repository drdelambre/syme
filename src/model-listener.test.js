import React from 'react';
import { shallow, mount } from 'enzyme';
import ModelListener from 'base/model-listener.js';
import Model from 'base/model.js';

class NoModel extends ModelListener {
	render() {
		return <div />;
	}
}

class BasicModel extends Model {
	constructor(data) {
		super({
			id: 0,
			name: ''
		});

		this.fill(data);
	}
}

class WithModel extends ModelListener {
	static defaultProps = {
		model: BasicModel
	};

	render() {
		return <div />;
	}
}

describe('ModelListener', function() {
	it('should throw an error if no model is defined', function() {
		expect(function() {
			shallow(<NoModel />);
		}).to.throw('ModelListener requires a model');
	});

	it('should not accept gibberish', function() {
		expect(function() {
			shallow(<NoModel model={ 'yolo' } />);
		}).to.throw('A model listener needs a model definition somewhere');
	});

	it('should initialize without a model', function() {
		const withoutModel = shallow(<WithModel />);

		expect(withoutModel.instance().model).to.exist;
		expect(withoutModel.instance().model.id).to.equal(0);
		expect(withoutModel.instance().model.name).to.equal('');
	});

	it('should initialize with a model', function() {
		const fullModel = new BasicModel({
				id: 7,
				name: 'beans'
			}),
			jsonModel = {
				id: 12,
				name: 'hashtag'
			},
			withModel = shallow(<WithModel model={ fullModel } />),
			withJson = shallow(<WithModel model={ jsonModel } />);

		expect(withModel.instance().model).to.exist;
		expect(withModel.instance().model.id).to.equal(7);
		expect(withModel.instance().model.name).to.equal('beans');

		expect(withJson.instance().model).to.exist;
		expect(withJson.instance().model.id).to.equal(12);
		expect(withJson.instance().model.name).to.equal('hashtag');
	});

	it('should update the model from the view', function(done) {
		const model = new BasicModel(),
			wrapper = mount(<WithModel model={ model } />),
			spy = sinon.spy();

		model.onUpdate('name', spy);

		wrapper.instance().update('name', 'yolo');

		// there's some throttling of var changes in here
		setTimeout(function() {
			try {
				expect(spy.callCount).to.equal(1);
				expect(model.name).to.equal('yolo');
				done();
			} catch (e) {
				done(e);
			}
		}, 100);
	});

	it('should allow bind scope', function() {
		const model = new BasicModel(),
			spy = sinon.spy();

		model.onUpdate = spy;

		const wrapper = mount(<WithModel model={ model } watchOnly={ ['name'] } />);

		expect(spy.callCount).to.equal(1);
		expect(spy.getCall(0).args[0]).to.equal('name');
	});
});
