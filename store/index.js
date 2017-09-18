import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native';
import reducers from '../reducers';
import actions from '../actions';
import { startupSaga } from '../sagas';

const saga = createSagaMiddleware();

const store = createStore(
  reducers,
  actions,
  compose(applyMiddleware(saga), applyMiddleware(thunk), autoRehydrate())
);

persistStore(store, { storage: AsyncStorage, whitelist: ['main', 'auth', 'analytics'] });

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers/index');
    store.replaceReducer(nextRootReducer);
  });
}

saga.run(startupSaga);

export default store;
