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

describe('ModelListener', () => {
    it('should throw an error if no model is defined', () => {
        expect(() => {
            shallow(<NoModel />);
        }).toThrow('ModelListener requires a model');
    });

    it('should not accept gibberish', () => {
        expect(() => {
            shallow(<NoModel model={ 'yolo' } />);
        }).toThrow('A model listener needs a model definition somewhere');
    });

    it('should initialize without a model', () => {
        const withoutModel = shallow(
            <WithModel />,
            { disableLifecycleMethods: true }
        );

        expect(withoutModel.instance().model).toBeDefined();
        expect(withoutModel.instance().model.id).toEqual(0);
        expect(withoutModel.instance().model.name).toEqual('');
    });

    it('should initialize with a model', () => {
        const fullModel = new BasicModel({
                id: 7,
                name: 'beans'
            }),
            jsonModel = {
                id: 12,
                name: 'hashtag'
            },
            withModel = shallow(
                <WithModel model={ fullModel } />,
                { disableLifecycleMethods: true }
            ),
            withJson = shallow(
                <WithModel model={ jsonModel } />,
                { disableLifecycleMethods: true }
            );

        expect(withModel.instance().model).toBeDefined();
        expect(withModel.instance().model.id).toEqual(7);
        expect(withModel.instance().model.name).toEqual('beans');

        expect(withJson.instance().model).toBeDefined();
        expect(withJson.instance().model.id).toEqual(12);
        expect(withJson.instance().model.name).toEqual('hashtag');
    });

    it('should update the model from the view', (done) => {
        const model = new BasicModel(),
            wrapper = mount(<WithModel model={ model } />),
            spy = jest.fn();

        model.onUpdate('name', spy);

        wrapper.instance().update('name', 'yolo');

        // there's some throttling of var changes in here
        setTimeout(() => {
            try {
                expect(spy.mock.calls.length).toEqual(1);
                expect(model.name).toEqual('yolo');
                done();
            } catch (e) {
                done(e);
            }
        }, 100);
    });

    it('should allow bind scope', () => {
        const model = new BasicModel(),
            spy = jest.fn();

        model.onUpdate = spy;

        mount(<WithModel model={ model } watchOnly={ [ 'name' ] } />);

        expect(spy.mock.calls.length).toEqual(1);
        expect(spy.mock.calls[0][0]).toEqual('name');
    });
});
