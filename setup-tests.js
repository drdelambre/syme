import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

window.crypto = require('@trust/webcrypto');

Enzyme.configure({ adapter: new Adapter() });

