import React from 'react'
import { View } from 'react-native'

const Separator = ({ style }) => {
  return <View style={{ width: '100%', height: 1, backgroundColor: 'lightgrey', ...style }} />
}

export default Separator
