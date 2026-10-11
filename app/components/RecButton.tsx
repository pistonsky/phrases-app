import React, { Component } from 'react';
import { Animated } from 'react-native';
import FontAwesome from '@react-native-vector-icons/fontawesome';
import { createSound } from 'react-native-nitro-sound';
import * as RNFS from '@dr.pogodin/react-native-fs';
import { store } from 'app/redux';
import { RECORDING_PERMISSIONS_DENIED } from 'app/actions/types';

// kept apart from the add-new form's recording.mp4 so the two never overwrite each other
const RECORDING_PATH = `${RNFS.DocumentDirectoryPath}/rerecording.mp4`;

export default class RecButton extends Component<any, any> {
  [key: string]: any
  constructor(props) {
    super(props);
    this.state = {
      recorded: false,
      isRecording: false,
      isPlaying: false,
      recordingDuration: 0
    };
    this.sound = createSound();
    this.animated = {
      recordButtonScale: new Animated.Value(1)
    };
  }

  componentWillUnmount() {
    const { isRecording, isPlaying } = this.state;
    this._unmounted = true;
    clearInterval(this._interval);
    this.sound.removePlaybackEndListener();
    if (isRecording) {
      this.sound.stopRecorder().catch(() => {});
    }
    if (isPlaying) {
      this.sound.stopPlayer().catch(() => {});
    }
  }

  reset() {
    this.setState({ recorded: false, recordingDuration: 0 });
  }

  _onTouchStart() {
    const { recorded, isRecording } = this.state;
    if (recorded) {
      this._play();
    } else if (isRecording) {
      this._stopRecording();
    } else {
      this._startRecording();
    }
  }

  _onTouchEnd() {
    const { isRecording, recordingDuration } = this.state;
    if (isRecording && recordingDuration > 0) {
      this._stopRecording();
    }
  }

  async _startRecording() {
    try {
      // asks for the microphone the first time
      await this.sound.startRecorder(RECORDING_PATH);
    } catch (e) {
      console.log('startRecorder failed', e);
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
      return;
    }
    if (this._unmounted) {
      // the modal was closed while the recorder was starting up
      this.sound.stopRecorder().catch(() => {});
      return;
    }
    this._recordingStartTime = new Date();
    this._interval = setInterval(() => {
      this.setState({ recordingDuration: (Number(new Date()) - Number(this._recordingStartTime)) / 1000 });
    }, 100);
    this.setState({ isRecording: true });
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1.5,
      duration: 200,
      useNativeDriver: true
    }).start();
  }

  async _stopRecording() {
    const { onStopRecording } = this.props;
    clearInterval(this._interval);
    this.setState({ isRecording: false, recorded: true });
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    try {
      await this.sound.stopRecorder();
    } catch (e) {
      console.log('stopRecorder failed', e);
      this.reset();
      return;
    }
    // only now is the file complete
    onStopRecording(RECORDING_PATH);
    this._play();
  }

  async _play() {
    this.setState({ isPlaying: true });
    this.sound.addPlaybackEndListener(() => {
      this.sound.removePlaybackEndListener();
      this.setState({ isPlaying: false });
    });
    try {
      await this.sound.startPlayer(RECORDING_PATH);
    } catch (e) {
      console.log('startPlayer failed', e);
      this.sound.removePlaybackEndListener();
      this.setState({ isPlaying: false });
    }
  }

  render() {
    const { size } = this.props;
    const { recorded, isPlaying } = this.state;
    return (
      <Animated.View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: recorded ? '#fa4' : '#f00',
          transform: [{ scale: this.animated.recordButtonScale }]
        }}
        onTouchStart={() => this._onTouchStart()}
        onTouchEnd={() => this._onTouchEnd()}
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
  }
}
