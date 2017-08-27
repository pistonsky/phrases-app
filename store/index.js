import { createStore, compose, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native';
import reducers from '../reducers';
import { startupSaga } from '../sagas';

// create the saga middleware
const saga = createSagaMiddleware();

const store = createStore(
  reducers,
  {},
  compose(applyMiddleware(saga), applyMiddleware(thunk), autoRehydrate())
);

persistStore(store, { storage: AsyncStorage, whitelist: ['auth'] });

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers/index');
    store.replaceReducer(nextRootReducer);
  });
}

saga.run(startupSaga);

export default store;
