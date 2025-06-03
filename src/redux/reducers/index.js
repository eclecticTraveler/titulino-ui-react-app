import { combineReducers } from 'redux';
import Auth from './Auth';
import Theme from './Theme';
import Lrn from './Lrn';
import Analytics from './Analytics';
import Grant from './Grant';

const reducers = combineReducers({
    theme: Theme,
    auth: Auth,
    lrn: Lrn,
    analytics: Analytics,
    grant: Grant
});

export default reducers;