import { createStore, compose, applyMiddleware } from 'redux'
import createSagaMiddleware from 'redux-saga'
import thunk from 'redux-thunk'
import { persistStore, persistReducer } from 'redux-persist'
import { AsyncStorage } from 'react-native'
import reducers from 'app/reducers'
import actions from 'app/actions'
import startupSaga from 'app/sagas/startupSaga'

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['main', 'auth', 'analytics', 'form'],
}

const persistedReducer = persistReducer(persistConfig, reducers)

const saga = createSagaMiddleware()

const store = createStore(
  persistedReducer,
  actions,
  compose(
    applyMiddleware(saga),
    applyMiddleware(thunk),
  ),
)

const persistor = persistStore(store)

if (module.hot) {
  // Enable Webpack hot module replacement for reducers
  module.hot.accept('../reducers', () => {
    const nextRootReducer = require('../reducers/index').default
    store.replaceReducer(persistReducer(persistConfig, nextRootReducer))
  })
}

saga.run(startupSaga)

export { store, persistor }

export default store
