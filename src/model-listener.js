import React from 'react';
import ReactDOM from 'react-dom';
import Model from 'base/model.js';

/**\

    ModelListener
        watches models for updates, when the update is passed through
        the param.model field. If a param named watchOnly is sent, the
        view will only update when those fields are updated in the model

\**/

class ModelListener extends React.Component {
    model = null;

    constructor(props) {
        let bindWatch,
            ni;

        if (!props.hasOwnProperty('model')) {
            throw new Error('ModelListener requires a model');
        }

        super(props);

        if (props.model instanceof Model) {
            // already initialized model
            this.model = props.model;
        } else if (props.model.prototype instanceof Model) {
            // just a definition
            this.model = new props.model();
        } else {
            try {
                //just a json object
                this.model = new this.constructor
                    .defaultProps.model(props.model);
            } catch (e) {
                throw new Error('A model listener needs a ' +
                    'model definition somewhere');
            }
        }

        if (!this.props.hasOwnProperty('watchOnly')) {
            this.model.onUpdate('*', this._update.bind(this));
        } else {
            bindWatch = function(key) {
                this.model.onUpdate(key, this._update.bind(this));
            }.bind(this);

            for (ni = 0; ni < this.props.watchOnly.length; ni++) {
                bindWatch(this.props.watchOnly[ni]);
            }
        }
    }

    _update() {
        /* istanbul ignore else: can't test server side rendering */
        if (typeof window !== 'undefined' && this.node) {
            this.setState(this.state || {});
        }
    }

    componentDidMount() {
        this.node = ReactDOM.findDOMNode(this);
    }

    componentWillUnmount() {
        /* istanbul ignore next: cant unmount */
        this.node = null;
    }

    update(field, value) {
        const _state = {};

        _state[field] = value;

        this.model.fill(_state);
    }
}

export default ModelListener;
