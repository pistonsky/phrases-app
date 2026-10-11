import React, { useState, useEffect } from 'react'
import { Animated } from 'react-native'

const FadingView = props => {
  const { visible, style, children, ...rest } = props

  const [_visibility] = useState(new Animated.Value(visible ? 1 : 0))
  useEffect(() => {
    Animated.timing(_visibility, {
      toValue: props.visible ? 1 : 0,
      duration: 300,
    }).start()
  })

  const containerStyle = {
    opacity: _visibility.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    }),
    transform: [
      {
        scale: _visibility.interpolate({
          inputRange: [0, 1],
          outputRange: [1.1, 1],
        }),
      },
    ],
  }

  const combinedStyle = [containerStyle, style]
  return (
    <Animated.View style={combinedStyle} {...rest}>
      {children}
    </Animated.View>
  )
}

export default FadingView
