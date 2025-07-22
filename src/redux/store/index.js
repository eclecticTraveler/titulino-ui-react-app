import { configureStore } from '@reduxjs/toolkit';
import reducers from '../reducers';
import createSagaMiddleware from 'redux-saga';
import rootSaga from '../sagas/index';
import axiosMiddleware from 'redux-axios-middleware';
import HttpService from '../../services/HttpService';
import reduxPromise from 'redux-promise';

const sagaMiddleware = createSagaMiddleware();

const customMiddlewares = [
  sagaMiddleware,
  reduxPromise,
  axiosMiddleware(HttpService.getAxiosClient()),
];

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: false, serializableCheck: false }).concat(customMiddlewares),
  devTools: process.env.REACT_APP_ENV !== 'production',
});

sagaMiddleware.run(rootSaga);

if (module.hot) {
  module.hot.accept('../reducers/index', () => {
    const nextRootReducer = require('../reducers/index').default;
    store.replaceReducer(nextRootReducer);
  });
}

export default store;
