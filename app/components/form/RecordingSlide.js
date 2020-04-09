import React from 'react'
import { View, Text, Animated, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import { Circle as Progress } from 'react-native-progress'
import { Button } from 'app/components'
import { store } from 'app/redux'
import { CLOSE_ADD_NEW_MODAL } from 'app/actions/types'
import styles from 'app/styles'
import colors from 'app/styles/colors'

const RecordingSlide = props => {
  const {
    recordingDuration,
    recorded,
    uploaded,
    playbackProgress,
    animated,
    onTouchStart,
    onTouchEnd,
    isPlaying,
    isRecording,
    onDone,
    onReset,
  } = props
  return (
    <View style={styles.formSlide}>
      <Text style={[styles.formHeader, { marginTop: 20 }]}>
        {recordingDuration === 0 ? 'Say it!' : recordingDuration.toFixed(2)}
      </Text>
      <View style={styles.formRecordButtonContainer}>
        {recorded && (
          <Progress
            style={styles.formCircleProgress}
            size={120}
            thickness={6}
            color={uploaded ? '#fa4' : '#f00'}
            animated={false}
            unfilledColor="#4af"
            borderWidth={0}
            progress={playbackProgress}
          />
        )}
        <Animated.View
          style={{
            ...styles.recordButton,
            backgroundColor: recorded ? '#fa4' : '#f00',
            transform: [{ scale: animated.recordButtonScale }],
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}>
          {recorded &&
            (isPlaying ? (
              <FontAwesome name="play-circle" size={100} color="red" style={{ backgroundColor: 'transparent' }} />
            ) : (
              <FontAwesome name="play-circle-o" size={100} color="red" style={{ backgroundColor: 'transparent' }} />
            ))}
        </Animated.View>
      </View>
      <View style={{ height: 50, justifyContent: 'center', alignItems: 'center' }}>
        {!recorded ? (
          <Text style={{ fontSize: 30, textAlign: 'center', color: colors.primary_light }}>
            {recordingDuration > 0 && 'Recording...'}
          </Text>
        ) : (
          <Button fontWeight="bold" title="Done!" disabled={!recorded} onPress={onDone} />
        )}
      </View>
      <View style={{ height: 100 }}>
        <TouchableOpacity
          onPress={() => {
            if (recorded) {
              onReset()
            } else {
              store.dispatch({ type: CLOSE_ADD_NEW_MODAL })
            }
          }}>
          {recorded ? (
            <View
              style={{
                opacity: 0.7,
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 10,
              }}>
              <Icon name="ios-refresh-circle" type="ionicon" size={40} color={colors.white} />
              <Text style={{ color: colors.white, fontSize: 12, marginTop: -2 }}>Reset</Text>
            </View>
          ) : (
            !isRecording && (
              <View
                style={{
                  opacity: 0.5,
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: 10,
                }}>
                <Icon name="ios-close-circle" type="ionicon" size={30} color={colors.white} />
                <Text style={{ color: colors.white, fontSize: 12 }}>Cancel</Text>
              </View>
            )
          )}
        </TouchableOpacity>
      </View>
    </View>
  )
}

export default RecordingSlide
