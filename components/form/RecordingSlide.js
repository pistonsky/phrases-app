import React from 'react';
import { View, Text, Animated, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { Circle as Progress } from 'react-native-progress';
import { Button } from '../index';
import store from '../../store';
import { CLOSE_ADD_NEW_MODAL } from '../../actions/types';
import styles from '../../styles';
import colors from '../../styles/colors';

const RecordingSlide = props => {
  return (
    <View style={styles.formSlide}>
      <Text style={[styles.formHeader, { marginTop: 20 }]}>
        {props.recordingDuration === 0
          ? 'Say it!'
          : props.recordingDuration.toFixed(2)}
      </Text>
      <View style={styles.formRecordButtonContainer}>
        {props.recorded && (
            <Progress
              style={styles.formCircleProgress}
              size={120}
              thickness={6}
              color={props.uploaded ? '#fa4' : '#f00'}
              animated={false}
              unfilledColor="#4af"
              borderWidth={0}
              progress={props.playbackProgress}
            />
          )}
        <Animated.View
          style={{
            ...styles.recordButton,
            backgroundColor: props.recorded ? '#fa4' : '#f00',
            transform: [{ scale: props.animated.recordButtonScale }]
          }}
          onTouchStart={props.onTouchStart}
          onTouchEnd={props.onTouchEnd}
        >
          {props.recorded &&
            (props.isPlaying ? (
              <FontAwesome
                name="play-circle"
                size={100}
                color="red"
                style={{ backgroundColor: 'transparent' }}
              />
            ) : (
              <FontAwesome
                name="play-circle-o"
                size={100}
                color="red"
                style={{ backgroundColor: 'transparent' }}
              />
            ))}
        </Animated.View>
      </View>
      {!props.recorded ? (
        <View style={{ height: 50, justifyContent: 'center' }}>
          <Text style={[styles.formHeader, { fontSize: 30 }]}>
            {(props.recordingDuration > 0) && 'Recording...'}
          </Text>
        </View>
      ) : (
        <Button
          fontWeight="bold"
          title="Done!"
          disabled={!props.recorded}
          onPress={props.onDone}
        />
      )}
      <TouchableOpacity
        onPress={() => {
          if (props.recorded) {
            props.onReset();
          } else {
            store.dispatch({ type: CLOSE_ADD_NEW_MODAL });
          }
        }}
      >
        {props.recorded ? (
          <View
            style={{
              opacity: 0.7,
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 10
            }}
          >
            <Icon
              name="ios-refresh-circle"
              type="ionicon"
              size={40}
              color={colors.white}
            />
            <Text style={{ color: colors.white, fontSize: 12, marginTop: -2 }}>Reset</Text>
          </View>
        ) : (
          <View
            style={{
              opacity: 0.5,
              flexDirection: 'column',
              alignItems: 'center',
              marginBottom: 10
            }}
          >
            <Icon
              name="ios-close-circle"
              type="ionicon"
              size={30}
              color={colors.white}
            />
            <Text style={{ color: colors.white, fontSize: 12 }}>Cancel</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default RecordingSlide;
