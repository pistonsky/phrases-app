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
      <Text style={styles.formHeader}>
        {props.recordingDuration === 0
          ? 'Say it!'
          : props.recordingDuration.toFixed(2)}
      </Text>
      <View style={styles.formRecordButtonContainer}>
        {(props.isUploading || props.uploaded) && (
            <Progress
              style={styles.formCircleProgress}
              size={120}
              thickness={6}
              color={props.uploaded ? '#fa4' : '#f00'}
              animated={false}
              unfilledColor="#4af"
              borderWidth={0}
              progress={
                props.isUploading
                  ? props.uploadProgress
                  : props.playbackProgress
              }
              indeterminate={props.uploadProgress === undefined}
            />
          )}
        <Animated.View
          style={{
            ...styles.recordButton,
            backgroundColor: props.uploaded ? '#fa4' : '#f00',
            transform: [{ scale: props.animated.recordButtonScale }]
          }}
          onTouchStart={props.onTouchStart}
          onTouchEnd={props.onTouchEnd}
        >
          {props.uploaded &&
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
      <Button
        fontWeight="bold"
        title="Done!"
        disabled={!props.uploaded}
        onPress={props.onDone}
      />
      <TouchableOpacity
        onPress={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}
      >
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
      </TouchableOpacity>
    </View>
  );
};

export default RecordingSlide;
