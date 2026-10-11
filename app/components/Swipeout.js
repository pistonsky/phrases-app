import React, { useMemo, useRef, useState } from 'react'
import { Animated, PanResponder, StyleSheet, Text, TouchableHighlight, View } from 'react-native'

// Minimal replacement for the unmaintained react-native-swipeout (its string refs and ViewPropTypes don't work on
// React 19 / current React Native). Supports the subset the app uses: `right` buttons, `autoClose` and `style`.

const SENSITIVITY = 50
const TWEEN_DURATION = 160

const SwipeoutButton = ({ button, width, height, onPress }) => (
  <TouchableHighlight
    style={[styles.button, { width, height }, button.backgroundColor && { backgroundColor: button.backgroundColor }]}
    underlayColor={button.underlayColor}
    onPress={onPress}
  >
    {button.component ? (
      <View style={{ width, height }}>{button.component}</View>
    ) : (
      <Text numberOfLines={1} style={styles.buttonText}>
        {button.text}
      </Text>
    )}
  </TouchableHighlight>
)

const Swipeout = ({ right = [], autoClose = false, style, children }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 })
  const [isOpen, setIsOpen] = useState(false)
  const [isRevealed, setIsRevealed] = useState(false)
  const translateX = useRef(new Animated.Value(0)).current

  const buttonWidth = layout.width / 5
  const buttonsWidth = buttonWidth * right.length

  const animateTo = open => {
    setIsOpen(open)
    Animated.timing(translateX, {
      toValue: open ? -buttonsWidth : 0,
      duration: open ? TWEEN_DURATION : TWEEN_DURATION * 1.5,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !open) {
        setIsRevealed(false)
      }
    })
  }

  // the pan responder is created once, so it reads the latest values through a ref
  const latest = useRef({})
  latest.current = { isOpen, buttonsWidth, contentWidth: layout.width, animateTo }

  const panResponder = useMemo(() => {
    const isHorizontalSwipe = (e, { dx, dy }) => Math.abs(dx) > SENSITIVITY && Math.abs(dy) <= SENSITIVITY
    return PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // while the buttons are shown, a tap on the row only closes it
      onStartShouldSetPanResponderCapture: () => latest.current.isOpen,
      onMoveShouldSetPanResponderCapture: isHorizontalSwipe,
      onPanResponderGrant: () => {
        translateX.stopAnimation()
        setIsRevealed(true)
      },
      onPanResponderMove: (e, { dx }) => {
        const { isOpen: open, buttonsWidth: limit } = latest.current
        const position = (open ? -limit : 0) + dx
        if (position > 0) {
          translateX.setValue(0) // there are no buttons on the left
        } else if (position < -limit) {
          translateX.setValue(-limit - (-position - limit) ** 0.85) // rubber band past the buttons
        } else {
          translateX.setValue(position)
        }
      },
      onPanResponderRelease: (e, { dx, vx }) => {
        const { isOpen: open, buttonsWidth: limit, contentWidth, animateTo: animate } = latest.current
        const openX = contentWidth * 0.33
        let shouldOpen
        if (open) {
          shouldOpen = Math.abs(dx) >= 5 && dx < openX // anything but a tap or a swipe back keeps it open
        } else {
          shouldOpen = dx < -openX || dx < -limit / 2 || (dx < 0 && vx < -0.5)
        }
        animate(shouldOpen && limit > 0)
      },
      onPanResponderTerminate: () => latest.current.animateTo(false),
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => false,
    })
  }, [translateX])

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={{ transform: [{ translateX }] }}
        onLayout={({ nativeEvent }) => setLayout(nativeEvent.layout)}
        {...panResponder.panHandlers} // eslint-disable-line react/jsx-props-no-spreading
      >
        {children}
      </Animated.View>
      {isRevealed && buttonsWidth > 0 && (
        <Animated.View
          style={[
            styles.buttons,
            {
              width: buttonsWidth,
              // the buttons slide in from the right edge together with the row
              transform: [
                {
                  translateX: translateX.interpolate({
                    inputRange: [-buttonsWidth, 0],
                    outputRange: [0, buttonsWidth],
                    extrapolate: 'clamp',
                  }),
                },
              ],
            },
          ]}
        >
          {right.map((button, i) => (
            <SwipeoutButton
              // eslint-disable-next-line react/no-array-index-key
              key={i}
              button={button}
              width={buttonWidth}
              height={layout.height}
              onPress={() => {
                if (autoClose) {
                  animateTo(false)
                }
                if (button.onPress) {
                  button.onPress()
                }
              }}
            />
          ))}
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#dbddde',
    overflow: 'hidden',
  },
  buttons: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b6bec0',
    overflow: 'hidden',
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
})

export default Swipeout
