import { combineReducers } from 'redux';
import Auth from './Auth';
import Theme from './Theme';
import Lrn from './Lrn';

const reducers = combineReducers({
    theme: Theme,
    auth: Auth,
    lrn: Lrn
});

export default reducers;