import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Animated } from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { createSound } from 'react-native-nitro-sound';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { store } from 'app/redux';
import { RECORDING_PERMISSIONS_DENIED } from 'app/actions/types';

// kept apart from the add-new form's recording.mp4 so the two never overwrite each other
const RECORDING_PATH = `${RNFS.DocumentDirectoryPath}/rerecording.mp4`;

const RecButton = forwardRef(({ size, onStopRecording }: any, ref) => {
  const [recorded, setRecorded] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const sound = useRef(createSound()).current;
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const unmounted = useRef(false);
  const interval = useRef<any>(null);
  const recordingStartTime = useRef<any>(null);
  const latest = useRef({ recorded, isRecording, isPlaying, recordingDuration, onStopRecording });
  latest.current = { recorded, isRecording, isPlaying, recordingDuration, onStopRecording };

  const reset = () => {
    setRecorded(false);
    setRecordingDuration(0);
  };

  useImperativeHandle(ref, () => ({ reset }));

  useEffect(() => {
    return () => {
      const current = latest.current;
      unmounted.current = true;
      clearInterval(interval.current);
      sound.removePlaybackEndListener();
      if (current.isRecording) {
        sound.stopRecorder().catch(() => {});
      }
      if (current.isPlaying) {
        sound.stopPlayer().catch(() => {});
      }
    };
  }, [sound]);

  const play = async () => {
    setIsPlaying(true);
    sound.addPlaybackEndListener(() => {
      sound.removePlaybackEndListener();
      setIsPlaying(false);
    });
    try {
      await sound.startPlayer(RECORDING_PATH);
    } catch (e) {
      console.log('startPlayer failed', e);
      sound.removePlaybackEndListener();
      setIsPlaying(false);
    }
  };

  const stopRecording = async () => {
    clearInterval(interval.current);
    setIsRecording(false);
    setRecorded(true);
    Animated.timing(recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    try {
      await sound.stopRecorder();
    } catch (e) {
      console.log('stopRecorder failed', e);
      reset();
      return;
    }
    // only now is the file complete
    latest.current.onStopRecording(RECORDING_PATH);
    play();
  };

  const startRecording = async () => {
    try {
      // asks for the microphone the first time
      await sound.startRecorder(RECORDING_PATH);
    } catch (e) {
      console.log('startRecorder failed', e);
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
      return;
    }
    if (unmounted.current) {
      // the modal was closed while the recorder was starting up
      sound.stopRecorder().catch(() => {});
      return;
    }
    recordingStartTime.current = new Date();
    interval.current = setInterval(() => {
      setRecordingDuration((Number(new Date()) - Number(recordingStartTime.current)) / 1000);
    }, 100);
    setIsRecording(true);
    Animated.timing(recordButtonScale, {
      toValue: 1.5,
      duration: 200,
      useNativeDriver: true
    }).start();
  };

  const onTouchStart = () => {
    const current = latest.current;
    if (current.recorded) {
      play();
    } else if (current.isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const onTouchEnd = () => {
    const current = latest.current;
    if (current.isRecording && current.recordingDuration > 0) {
      stopRecording();
    }
  };

  return (
    <Animated.View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: recorded ? '#fa4' : '#f00',
        transform: [{ scale: recordButtonScale }]
      }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {recorded && (
        <FontAwesome
          name={isPlaying ? 'play-circle' : 'play-circle-o'}
          size={100}
          color="red"
          style={{ backgroundColor: 'transparent' }}
        />
      )}
    </Animated.View>
  );
});

export default RecButton;
