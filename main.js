import Expo from 'expo';
import React from 'react';
import { Provider } from 'react-redux';
import AppRouter from './AppRouter';
import store from './store';

console.ignoredYellowBox = ['Warning: checkPropTypes'];

class Root extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <AppRouter />
      </Provider>
    );
  }
}

Expo.registerRootComponent(Root);
