import React, { Component } from 'react';
import { Scene, Router, Tabs } from 'react-native-router-flux';
import store from './store';

import LoadingScreen from './screens/LoadingScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import MainScreen from './screens/MainScreen';

import { Platform, Text } from 'react-native';

import { OPEN_ADD_NEW_MODAL } from './actions/types';

class AppRouter extends Component {
  render() {
    return (
      <Router sceneStyle={{ marginTop: Platform.OS === 'android' ? 20 : 0 }}>
        <Tabs key="root" hideTabBar>
          <Scene
            key="loading"
            component={LoadingScreen}
            initial
            hideNavBar
            hideTabBar
          />
          <Scene
            key="welcome"
            component={WelcomeScreen}
            hideNavBar
            hideTabBar
          />
          <Scene
            key="main"
            component={MainScreen}
            back={false}
            navigationBarStyle={styles.navBar}
            hideTabBar
            rightTitle="Add"
            rightButtonTextStyle={{ marginLeft: 5 }}
            onRight={() => {
              store.dispatch({ type: OPEN_ADD_NEW_MODAL });
            }}
          />
        </Tabs>
      </Router>
    );
  }
}

const styles = {
  navBar: { backgroundColor: '#48f' }
};

export default AppRouter;
