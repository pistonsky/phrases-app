import React, { useEffect } from 'react'
import { View, Image } from 'react-native'
import { ROUTER_READY } from 'app/actions/types'
import { store } from 'app/redux'

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  image: {
    width: 256,
    height: 256,
  },
} as const

const LoaderScreen = () => {
  useEffect(() => {
    store.dispatch({ type: ROUTER_READY })
  }, [])

  return (
    <View style={styles.container}>
      <Image style={styles.image} source={require('assets/icons/loading.png')} />
    </View>
  )
}

export default LoaderScreen
