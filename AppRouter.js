import React from 'react'
import { Platform, View } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context'

import LoadingScreen from 'app/screens/LoadingScreen'
import WelcomeScreen from 'app/screens/WelcomeScreen'
import MainScreen from 'app/screens/MainScreen'

import { ConnectFacebookModal, NavBar } from 'app/containers'
import { navigationRef } from 'app/navigation'

const Stack = createNativeStackNavigator()

const renderNavBar = () => <NavBar />

const AppRouter = () => (
  // provides the safe area insets to the screens and the modals
  <SafeAreaProvider initialMetrics={initialWindowMetrics}>
    <NavigationContainer ref={navigationRef}>
      <View style={{ flex: 1, marginTop: Platform.OS === 'android' ? 20 : 0 }}>
        <Stack.Navigator initialRouteName="loading" screenOptions={{ headerShown: false, animation: 'none' }}>
          <Stack.Screen name="loading" component={LoadingScreen} />
          <Stack.Screen name="welcome" component={WelcomeScreen} />
          <Stack.Screen name="main" component={MainScreen} options={{ headerShown: true, header: renderNavBar }} />
        </Stack.Navigator>
      </View>
      {/* Rendered outside the screens so the account prompt can pop up on top of any of them */}
      <ConnectFacebookModal />
    </NavigationContainer>
  </SafeAreaProvider>
)

export default AppRouter
