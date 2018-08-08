import React from 'react';
import { mount } from 'enzyme';
import {
    copyStatic,
    default as connect
} from 'base/connect';
import Cache from 'base/cache';
import Model from 'base/model';

class TestComponent extends React.Component {
    static defaultProps = {
        name: 'defaultName',
        passthrough: 'not working',
        count: 0
    };

    render() {
        return (
            <div>
                <h1>{ this.props.name }</h1>
                <h2>{ this.props.passthrough }</h2>
                <label>{ this.props.count }</label>
            </div>
        );
    }
}

class User extends Model {
    constructor(data) {
        super({
            id: 0,
            name: ''
        });

        this.fill(data);
    }
}

class Todo extends Model {
    constructor(data) {
        super({
            id: 0,
            title: ''
        });

        this.fill(data);
    }
}

class Todos extends Model {
    constructor(data) {
        super({
            list: [ Todo ]
        });

        this.fill(data);
    }
}

class CurrentUser extends Cache {
    constructor() {
        super({
            model: User
        });
    }

    grabAndWatch(cb) {
        cb(this.cached);
        this.watch(cb);
    }
}

class TodoCache extends Cache {
    constructor(id) {
        super({
            model: Todos,
            key: 'todo-cache-' + id
        });
    }

    grabAndWatch(cb) {
        cb(this.cached);
        this.watch(cb);
    }
}

describe('Connect', () => {
    it('should be pass props through', () => {
        const spy = jest.fn(),
            Component = connect(TestComponent, spy),
            mounted = mount(<Component passthrough="working" />);

        expect(mounted.html()).toMatchSnapshot();
    });

    it('should update based on the cache', () => {
        const Component = connect(TestComponent, function() {
                if (!this._user) {
                    this._user = new CurrentUser();
                    this._user.grabAndWatch((user) => {
                        this.update('name', user.name);
                    });
                }
            }),
            mounted = mount(<Component passthrough="working" />),
            cache = new CurrentUser();

        cache.populate({ name: 'beans' });

        expect(mounted.html()).toMatchSnapshot();
    });

    it('should update use props', () => {
        const Component = connect(TestComponent, function(props) {
                if (props.id && this.props.id !== props.id) {
                    const cache = new TodoCache(props.id);

                    cache.grabAndWatch((data) => {
                        this.update(
                            'count',
                            data.list.reduce((prev) => {
                                return prev + 1;
                            }, 0)
                        );
                    });
                }
            }),
            mounted = mount(
                <Component id={ 12 }
                    passthrough="working" />
            ),
            cache = new TodoCache(24);

        cache.populate({
            list: [
                { id: 0, title: 'one' },
                { id: 1, title: 'two' },
                { id: 2, title: 'three' },
                { id: 3, title: 'four' }
            ]
        });

        expect(mounted.html()).toMatchSnapshot();

        mounted.setProps({ id: 24 });

        expect(mounted.html()).toMatchSnapshot();

        mounted.unmount();

        cache.populate({
            list: [
                { id: 0, title: 'one' },
                { id: 1, title: 'two' }
            ]
        });
    });

    describe('copy static', () => {
        class ClassOne {
            static hashtag = 'yolo';
            static beans = 'pinto';
        }

        class ClassTwo {
            static yolo = 'hashtag';
            static pinto = 'beans';
        }

        it('should ignore strings', () => {
            const obj = new ClassOne(),
                out = copyStatic(obj, 'yolo');

            expect(Object.getOwnPropertyNames(out))
                .toEqual(Object.getOwnPropertyNames(obj));
        });

        it('should copy over statics', () => {
            const countOne = Object.getOwnPropertyNames(ClassOne).length;
            const out = copyStatic(ClassOne, ClassTwo);

            expect(Object.getOwnPropertyNames(out).length)
                .toEqual(countOne + 2);
        });
    });
});
