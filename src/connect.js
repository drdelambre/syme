import React from 'react';

const STATICS = {
    arguments: true,
    arity: true,
    callee: true,
    caller: true,
    childContextTypes: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromProps: true,
    length: true,
    mixins: true,
    name: true,
    propTypes: true,
    prototype: true,
    type: true
};

function copyStatic(target, source) {
    if (typeof source === 'string') {
        return target;
    }

    let keys = Object.getOwnPropertyNames(source);

    /* istanbul ignore else: platform specific */
    if (Object.getOwnPropertySymbols) {
        keys = keys.concat(Object.getOwnPropertySymbols(source));
    }

    keys.forEach((key) => {
        if (STATICS[key]) {
            return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(source, key);

        try {
            Object.defineProperty(target, key, descriptor);
        } catch (e) {} // eslint-disable-line
    });

    return target;
}

export { copyStatic };

function connect(component, connect) {
    class ConnectedComponent extends React.Component {
        state = {};

        constructor(props, ctx) {
            super(props, ctx);

            connect.call(this, props);
        }

        componentWillReceiveProps(props) {
            connect.call(this, props);
        }

        update(prop, value) {
            const modifier = {};

            if (this.state[prop] === value) {
                return;
            }

            if (this._mounted) {
                modifier[prop] = value;

                this.setState(modifier);
            } else {
                this.state[prop] = value;
            }
        }

        componentDidMount() {
            this._mounted = true;
        }

        componentWillUnmount() {
            this._mounted = false;
        }

        render() {
            return React.createElement(
                component,
                Object.assign({}, this.props, this.state)
            );
        }
    }

    return copyStatic(ConnectedComponent, component);
}

export default connect;
