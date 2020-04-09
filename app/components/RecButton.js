import React, { Component } from 'react';
import { Animated } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome'

export default class RecButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      recorded: false,
      isRecording: false,
      isPlaying: false,
      recordingDuration: 0
    };
    this.recording = null;
    this.animated = {
      recordButtonScale: new Animated.Value(1)
    };
  }

  reset() {
    this.recording = null;
    this.setState({ recorded: false, recordingDuration: 0 });
  }

  async _onTouchStart() {
    if (this.state.recorded) {
      this._play();
    } else {
      if (this.state.isRecording) {
        this._stopRecording();
      } else {
        this._startRecording();
      }
    }
  }

  async _onTouchEnd() {
    this.state.isRecording &&
      this.state.recordingDuration > 0 &&
      this._stopRecording();
  }

  async _startRecording() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
      });
      this.recording = new Audio.Recording();
      this.recording
        .prepareToRecordAsync({
          android: {
            extension: '.m4a',
            outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000
          },
          ios: {
            extension: '.caf',
            audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_MIN,
            sampleRate: 44100,
            numberOfChannels: 2,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false
          }
        })
        .then(status => this.recording.startAsync());
      this._interval = setInterval(async () => {
        const status = await this.recording.getStatusAsync();
        if (status.durationMillis)
          this.setState({ recordingDuration: status.durationMillis / 1000 });
      }, 50);
      this.setState({ isRecording: true });
      Animated.timing(this.animated.recordButtonScale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true
      }).start();
    } catch (e) {
      console.log('_startRecording failed');
    }
  }

  async _stopRecording() {
    this.setState({ isRecording: false, recorded: true });
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    clearInterval(this._interval);
    this.props.onStopRecording();
    try {
      await this.recording.stopAndUnloadAsync();
      const { durationMillis } = await this.recording.getStatusAsync();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
      });
      const { sound, status } = await this.recording.createNewLoadedSound();
      this.sound = sound;
      this.sound.setOnPlaybackStatusUpdate(async playbackStatus => {
        if (playbackStatus.didJustFinish) {
          await this.sound.unloadAsync();
        }
      });
      await this.sound.playAsync();
    } catch (e) {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
  }

  async _play() {
    this.setState({ isPlaying: true });
    const { sound, status } = await this.recording.createNewLoadedSound();
    this.sound = sound;
    this.sound.setOnPlaybackStatusUpdate(async playbackStatus => {
      const { positionMillis, durationMillis } = playbackStatus;
      const progress = positionMillis / durationMillis;
      this.setState({
        playbackProgress: progress
      });
      if (playbackStatus.didJustFinish) {
        await this.sound.unloadAsync();
        this.setState({ isPlaying: false });
      }
    });
    await this.sound.playAsync();
  }

  render() {
    return (
      <Animated.View
        style={{
          width: this.props.size,
          height: this.props.size,
          borderRadius: this.props.size / 2,
          backgroundColor: '#f00',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: this.state.recorded ? '#fa4' : '#f00',
          transform: [{ scale: this.animated.recordButtonScale }]
        }}
        onTouchStart={() => this._onTouchStart()}
        onTouchEnd={() => this._onTouchEnd()}
      >
        {this.state.recorded &&
          (this.state.isPlaying ? (
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
    );
  }
}
