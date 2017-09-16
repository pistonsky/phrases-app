import { createStore, compose, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { persistStore, autoRehydrate } from 'redux-persist';
import { AsyncStorage } from 'react-native';
import reducers from '../reducers';
import actions from '../actions';

const store = createStore(
  reducers,
  actions,
  compose(applyMiddleware(thunk), autoRehydrate())
);

persistStore(store, { storage: AsyncStorage, whitelist: ['main', 'auth'] });

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers/index');
    store.replaceReducer(nextRootReducer);
  });
}

export default store;
