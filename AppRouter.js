import React, { Component } from 'react'
import { Scene, Router, Tabs } from 'react-native-router-flux'

import LoadingScreen from 'app/screens/LoadingScreen'
import WelcomeScreen from 'app/screens/WelcomeScreen'
import MainScreen from 'app/screens/MainScreen'

import { NavBar } from 'app/containers'

import { Platform } from 'react-native'

class AppRouter extends Component { // eslint-disable-line react/prefer-stateless-function
  render() {
    return (
      <Router sceneStyle={{ marginTop: Platform.OS === 'android' ? 20 : 0 }}>
        <Tabs key="root" hideTabBar>
          <Scene key="loading" component={LoadingScreen} initial hideNavBar hideTabBar />
          <Scene key="welcome" component={WelcomeScreen} hideNavBar hideTabBar />
          <Scene key="main" component={MainScreen} hideTabBar navBar={NavBar} />
        </Tabs>
      </Router>
    )
  }
}

export default AppRouter
