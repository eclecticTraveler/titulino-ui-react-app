import { combineReducers } from 'redux';
import Auth from './Auth';
import Theme from './Theme';
import Lrn from './Lrn';
import Analytics from './Analytics';

const reducers = combineReducers({
    theme: Theme,
    auth: Auth,
    lrn: Lrn,
    analytics: Analytics
});

export default reducers;