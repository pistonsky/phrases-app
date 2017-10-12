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
import { Icon } from 'react-native-elements';
import { Permissions, Audio, FileSystem } from 'expo';
import {
  TextInput,
  Button,
  NoPermissionsSlide,
  RecordingSlide,
  FadingView
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
      recorded: false,
      recordingDuration: 0,
      checkingPermissions: false,
      permissionsStage: 0,
      appState: AppState.currentState
    };
    this.animated = {
      recordButtonScale: new Animated.Value(1)
    };
  }

  async componentDidMount() {
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

    // the code below is used to speed up the first recording
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
    });
    const test_recording = new Audio.Recording();
    test_recording
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
      .then(async status => {
        await test_recording.startAsync();
        await test_recording.stopAndUnloadAsync();
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
    try {
      await this.recording.stopAndUnloadAsync();
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

  _resetRecording() {
    this.setState({ uploaded: false, recordingDuration: 0, recorded: false });
  }

  async _submit() {
    const uri = Math.random()
      .toString(36)
      .slice(2);
    // move local recording file to documents directory so we don't lose it
    await FileSystem.moveAsync({
      from: this.recording.getURI(),
      to: FileSystem.documentDirectory + uri + '.caf'
    });
    const phrase = {
      original: this.props.originalPhrase,
      translated: this.props.translatedPhrase,
      synced: false,
      uri: uri,
      dictionary: this.props.currentDictionary
    };
    store.dispatch({
      type: ADD_NEW_PHRASE,
      ...phrase
    });
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
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          ref={e => {
            this.scrollView = e;
          }}
          onScroll={({ nativeEvent: { contentOffset: { x } } }) => {
            const page = Math.ceil(x / SCREEN_WIDTH);
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
              autoFocus={this.props.currentPage === 0}
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
              autoFocus={this.props.currentPage === 1}
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
              isRecording={this.state.isRecording}
              uploaded={this.state.uploaded}
              recorded={this.state.recorded}
              uploadProgress={this.state.uploadProgress}
              playbackProgress={this.state.playbackProgress}
              animated={this.animated}
              onTouchStart={async () => {
                if (this.state.recorded) {
                  this._play();
                } else {
                  if (this.state.isRecording) {
                    this._stopRecording();
                  } else {
                    this._startRecording();
                  }
                }
              }}
              onTouchEnd={() => {
                this.state.isRecording &&
                  this.state.recordingDuration > 0 &&
                  this._stopRecording();
              }}
              onDone={() => this._submit()}
              onReset={() => this._resetRecording()}
            />
          )}
        </ScrollView>
        <FadingView
          visible={this.props.currentPage !== 2}
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            height: 50
          }}
        >
          <TouchableOpacity
            onPress={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}
          >
            <View
              style={{
                opacity: 0.5,
                flexDirection: 'column',
                alignItems: 'center'
              }}
            >
              <Icon
                name="ios-close-circle"
                type="ionicon"
                size={30}
                color={colors.white}
              />
              <Text
                style={{
                  color: colors.white,
                  backgroundColor: 'transparent',
                  fontSize: 12
                }}
              >
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
        </FadingView>
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
