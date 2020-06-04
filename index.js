import React from 'react'
import { AppRegistry } from 'react-native'
import { Provider } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import TrackPlayer from 'react-native-track-player'
import AppRouter from './AppRouter'
import { store, persistor } from './app/redux'

const phrazes = () => (
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AppRouter />
    </PersistGate>
  </Provider>
)

AppRegistry.registerComponent('phrazes60', () => phrazes)

TrackPlayer.registerPlaybackService(() => require('./audioService.js'))
