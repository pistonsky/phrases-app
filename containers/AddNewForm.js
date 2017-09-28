import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  View as KeyboardAvoidingView,
  Text,
  Dimensions,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
  AppState,
  Keyboard,
  Button as ReactNativeButton
} from 'react-native';
import { Permissions, Audio, FileSystem } from 'expo';
import { RNS3 } from 'react-native-aws3';
import {
  TextInput,
  Button,
  NoPermissionsSlide,
  RecordingSlide
} from '../components';
import {
  getRecordingPermissions,
  getOriginalPhrase,
  getTranslatedPhrase,
  getCurrentFormPage,
  getUserId,
  getCurrentDictionaryName
} from '../reducers/selectors';
import {
  SHOW_RECORDING_PERMISSIONS_MODAL,
  RECORDING_PERMISSIONS_DENIED,
  RECORDING_PERMISSIONS_GRANTED,
  ADD_NEW_PHRASE,
  FORM_ORIGINAL_CHANGED,
  FORM_TRANSLATED_CHANGED,
  FORM_SCROLL_TO_PAGE,
  CLOSE_ADD_NEW_MODAL
} from '../actions/types';
import store from '../store';
import * as config from '../utils/config';
import axios from 'axios';
import * as api from '../api';
import styles from '../styles';
import colors from '../styles/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

class AddNewForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isRecording: false,
      recordingDuration: 0,
      checkingPermissions: false,
      permissionsStage: 0,
      appState: AppState.currentState
    };
    this.animated = {
      recordButtonScale: new Animated.Value(1)
    };
  }

  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    if (this.props.haveRecordingPermissions !== undefined) {
      // undefined means we never asked for mic yet
      this._checkPermissionsAsync();
    }
    this.scrollView.scrollTo({
      x: SCREEN_WIDTH * this.props.currentPage,
      y: 0,
      animated: false
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = nextAppState => {
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active' &&
      this.state.permissionsStage === 1
    ) {
      this._checkPermissionsAsync();
    }
    this.setState({ appState: nextAppState });
  };

  async _askForPermissions() {
    if (
      Platform.OS === 'ios' &&
      this.props.haveRecordingPermissions !== undefined
    ) {
      // consequent permissions request won't work on ios - have to send user to Settings
      this.setState({ permissionsStage: 1 });
      Linking.openURL('App-prefs:root=Privacy&path=MICROPHONE');
    } else {
      const { status } = await Permissions.askAsync(
        Permissions.AUDIO_RECORDING
      );
      if (status === 'granted') {
        store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
      } else {
        store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
      }
    }
  }

  async _checkPermissionsAsync() {
    this.setState({ checkingPermissions: true });
    const { status } = await Permissions.getAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
    this.setState({ checkingPermissions: false, permissionsStage: 0 });
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
      const status = await this.recording.prepareToRecordAsync({
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
      });
      await this.recording.startAsync();
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
      alert('_startRecording failed');
    }
  }

  async _stopRecording() {
    this.setState({ isRecording: false });
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    clearInterval(this._interval);
    try {
      await this.recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: false,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
      });
      const uri = this.recording.getURI();
      this._uploadRecordingAsync(uri);
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

  async _uploadRecordingAsync(uri) {
    try {
      this.setState({ isUploading: true, uploadProgress: undefined });
      this.sound_uri = Math.random()
        .toString(36)
        .slice(2);
      const file = {
        uri,
        name: this.sound_uri + '.caf',
        type: 'audio/x-caf'
      };
      const options = {
        keyPrefix: '',
        bucket: config.S3_BUCKET,
        region: config.S3_REGION,
        accessKey: config.S3_ACCESS_KEY,
        secretKey: config.S3_SECRET_KEY,
        successActionStatus: 201
      };
      RNS3.put(file, options)
        .progress(e => this.setState({ uploadProgress: e.loaded / e.total }))
        .then(response => {
          if (response.status !== 201) {
            this.setState({ isUploading: false, uploaded: false });
          } else {
            this.setState({ isUploading: false, uploaded: true });
          }
        });
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          ref={e => {
            this.scrollView = e;
          }}
          onScroll={({ nativeEvent: { contentOffset: { x } } }) => {
            if (x % SCREEN_WIDTH === 0) {
              const page = x / SCREEN_WIDTH;
              store.dispatch({ type: FORM_SCROLL_TO_PAGE, page });
              if (
                this.props.haveRecordingPermissions === undefined &&
                page === 2
              ) {
                this._askForPermissions(); // ask for recording permissions when user first sees recording page
              }
              if (page === 0) {
                this._textInput1.focus();
              }
              if (page === 1) {
                this._textInput2.focus();
              }
              if (page === 2) {
                Keyboard.dismiss();
              }
            }
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formSlide}
          >
            <Text style={styles.formHeader}>Original:</Text>
            <TextInput
              value={this.props.originalPhrase}
              onChangeText={text =>
                store.dispatch({ type: FORM_ORIGINAL_CHANGED, payload: text })}
              autoFocus
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH,
                  y: 0,
                  animated: true
                });
                this._textInput2.focus();
              }}
              textInputRef={e => {
                this._textInput1 = e;
              }}
            />
            <Button
              title="Next"
              onPress={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH,
                  y: 0,
                  animated: true
                });
              }}
            />
          </KeyboardAvoidingView>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formSlide}
          >
            <Text style={styles.formHeader}>Translated:</Text>
            <TextInput
              value={this.props.translatedPhrase}
              onChangeText={text =>
                store.dispatch({
                  type: FORM_TRANSLATED_CHANGED,
                  payload: text
                })}
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true
                });
              }}
              textInputRef={e => {
                this._textInput2 = e;
              }}
            />
            <Button
              title="Next"
              onPress={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true
                });
              }}
            />
          </KeyboardAvoidingView>

          {this.props.haveRecordingPermissions === false &&
          !this.state.checkingPermissions ? (
            <NoPermissionsSlide
              onPress={() => this._askForPermissions()}
              onCancel={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}
            />
          ) : (
            <RecordingSlide
              recordingDuration={this.state.recordingDuration}
              isUploading={this.state.isUploading}
              isPlaying={this.state.isPlaying}
              uploaded={this.state.uploaded}
              uploadProgress={this.state.uploadProgress}
              playbackProgress={this.state.playbackProgress}
              animated={this.animated}
              onTouchStart={async () => {
                if (this.state.uploaded) {
                  this.setState({ isPlaying: true });
                  const {
                    sound,
                    status
                  } = await this.recording.createNewLoadedSound();
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
                } else {
                  this._startRecording();
                }
              }}
              onTouchEnd={() => {
                this.state.isRecording && this._stopRecording();
              }}
              onDone={() => {
                const phrase = {
                  original: this.props.originalPhrase,
                  translated: this.props.translatedPhrase,
                  localUri: this.recording.getURI(),
                  uri: this.sound_uri,
                  dictionary: this.props.currentDictionary
                };
                store.dispatch({
                  type: ADD_NEW_PHRASE,
                  ...phrase
                });
                const user_id = getUserId(store.getState());
                api.addPhrase(phrase, user_id);
              }}
            />
          )}
        </ScrollView>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    haveRecordingPermissions: getRecordingPermissions(state),
    originalPhrase: getOriginalPhrase(state),
    translatedPhrase: getTranslatedPhrase(state),
    currentDictionary: getCurrentDictionaryName(state),
    currentPage: getCurrentFormPage(state)
  };
}

export default connect(mapStateToProps)(AddNewForm);
