'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _model = require('./model.js');

var _model2 = _interopRequireDefault(_model);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**\

    ModelListener
        watches models for updates, when the update is passed through
        the param.model field. If a param named watchOnly is sent, the
        view will only update when those fields are updated in the model

\**/

var ModelListener = function (_React$Component) {
    (0, _inherits3.default)(ModelListener, _React$Component);

    function ModelListener(props) {
        (0, _classCallCheck3.default)(this, ModelListener);

        var bindWatch = void 0,
            ni = void 0;

        if (!props.hasOwnProperty('model')) {
            throw new Error('ModelListener requires a model');
        }

        var _this = (0, _possibleConstructorReturn3.default)(this, (ModelListener.__proto__ || Object.getPrototypeOf(ModelListener)).call(this, props));

        _this.model = null;


        if (props.model instanceof _model2.default) {
            // already initialized model
            _this.model = props.model;
        } else if (props.model.prototype instanceof _model2.default) {
            // just a definition
            _this.model = new props.model();
        } else {
            try {
                //just a json object
                _this.model = new _this.constructor.defaultProps.model(props.model);
            } catch (e) {
                throw new Error('A model listener needs a ' + 'model definition somewhere');
            }
        }

        if (!_this.props.hasOwnProperty('watchOnly')) {
            _this.model.onUpdate('*', _this._update.bind(_this));
        } else {
            bindWatch = function (key) {
                this.model.onUpdate(key, this._update.bind(this));
            }.bind(_this);

            for (ni = 0; ni < _this.props.watchOnly.length; ni++) {
                bindWatch(_this.props.watchOnly[ni]);
            }
        }
        return _this;
    }

    (0, _createClass3.default)(ModelListener, [{
        key: '_update',
        value: function _update() {
            /* istanbul ignore else: can't test server side rendering */
            if (typeof window !== 'undefined' && this.node) {
                this.setState(this.state || {});
            }
        }
    }, {
        key: 'componentDidMount',
        value: function componentDidMount() {
            this.node = _reactDom2.default.findDOMNode(this);
        }

        /* istanbul ignore next: cant unmount */

    }, {
        key: 'componentWillUnmount',
        value: function componentWillUnmount() {
            this.node = null;
        }
    }, {
        key: 'update',
        value: function update(field, value) {
            var _state = {};

            _state[field] = value;

            this.model.fill(_state);
        }
    }]);
    return ModelListener;
}(_react2.default.Component);

exports.default = ModelListener;