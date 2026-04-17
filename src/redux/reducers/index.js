import { combineReducers } from 'redux';
import Auth from './Auth';
import Theme from './Theme';
import Lrn from './Lrn';
import Analytics from './Analytics';
import Grant from './Grant';
import Shop from './Shop';
import AdminTools from './AdminTools';

const reducers = combineReducers({
    theme: Theme,
    auth: Auth,
    lrn: Lrn,
    analytics: Analytics,
    grant: Grant,
    shop: Shop,
    adminTools: AdminTools
});

export default reducers;