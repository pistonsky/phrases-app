import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Dimensions,
  Image,
  ScrollView,
  TouchableHighlight,
  TouchableOpacity,
  Animated,
  Platform,
  Linking,
  AppState,
  Button as ReactNativeButton
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { Permissions, Audio, FileSystem } from 'expo';
import { RNS3 } from 'react-native-aws3';
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
import { Circle as Progress } from 'react-native-progress';
import { FontAwesome } from '@expo/vector-icons';
import styles from '../styles';
import colors from '../styles/colors';
import { smartFontSize } from '../utils/functions';

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
            }
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.formSlide}
          >
            <Text style={styles.formHeader}>Original:</Text>
            <TextInput
              style={[
                styles.formTextInput,
                {
                  fontSize: smartFontSize({
                    max: 70,
                    min: 24,
                    threshold: 7,
                    text: this.props.originalPhrase
                  })
                }
              ]}
              underlineColorAndroid="transparent"
              selectionColor={colors.primary_light}
              value={this.props.originalPhrase}
              onChangeText={text =>
                store.dispatch({ type: FORM_ORIGINAL_CHANGED, payload: text })}
              autoFocus
              autoCorrect={false}
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH,
                  y: 0,
                  animated: true
                });
                this._textInput2.focus();
              }}
            />
            <Button
              backgroundColor={colors.secondary}
              raised
              large
              buttonStyle={styles.button}
              fontWeight="bold"
              borderRadius={Platform.OS === 'ios' ? 30 : 0}
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
              style={[
                styles.formTextInput,
                {
                  fontSize: smartFontSize({
                    max: 70,
                    min: 24,
                    threshold: 7,
                    text: this.props.translatedPhrase
                  })
                }
              ]}
              underlineColorAndroid="transparent"
              selectionColor={colors.primary_light}
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true
                });
              }}
              autoCorrect={false}
              ref={e => {
                this._textInput2 = e;
              }}
            />
            <Button
              backgroundColor={colors.secondary}
              raised
              large
              buttonStyle={styles.button}
              fontWeight="bold"
              borderRadius={Platform.OS === 'ios' ? 30 : 0}
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
            <View style={styles.formSlide}>
              <Text style={styles.noPermissionsTitle}>No Microphone</Text>
              <Text style={styles.noPermissionsSubtitle}>
                Please allow to use microphone to record the native speaker's
                voice for this phraze!
              </Text>
              {Platform.OS === 'ios' ? (
                <Image source={require('../assets/microphone.png')} />
              ) : null}
              <Button
                backgroundColor={colors.secondary}
                raised
                large
                buttonStyle={[styles.button, { marginBottom: 10 }]}
                fontWeight="bold"
                borderRadius={Platform.OS === 'ios' ? 30 : 0}
                onPress={() => this._askForPermissions()}
                title="Enable Microphone"
              />
              <TouchableOpacity onPress={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}>
                <View style={{ opacity: 0.7, flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
                  <Icon name='ios-close-circle' type='ionicon' size={30} color={colors.white} />
                  <Text style={{ color: colors.white, fontSize: 12 }}>Cancel</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : (
            <KeyboardAvoidingView behavior="padding" style={styles.formSlide}>
              <Animated.Text style={styles.formHeader}>
                {this.state.recordingDuration === 0
                  ? 'Say it!'
                  : this.state.recordingDuration.toFixed(2)}
              </Animated.Text>
              <View style={styles.formRecordButtonContainer}>
                {(this.state.isUploading || this.state.uploaded) && (
                    <Progress
                      style={styles.formCircleProgress}
                      size={120}
                      thickness={6}
                      color={this.state.uploaded ? '#fa4' : '#f00'}
                      animated={false}
                      unfilledColor="#4af"
                      borderWidth={0}
                      progress={
                        this.state.isUploading
                          ? this.state.uploadProgress
                          : this.state.playbackProgress
                      }
                      indeterminate={this.state.uploadProgress === undefined}
                    />
                  )}
                <Animated.View
                  style={{
                    ...styles.recordButton,
                    backgroundColor: this.state.uploaded ? '#fa4' : '#f00',
                    transform: [{ scale: this.animated.recordButtonScale }]
                  }}
                  onTouchStart={async () => {
                    if (this.state.uploaded) {
                      this.setState({ isPlaying: true });
                      const {
                        sound,
                        status
                      } = await this.recording.createNewLoadedSound();
                      this.sound = sound;
                      this.sound.setOnPlaybackStatusUpdate(
                        async playbackStatus => {
                          const {
                            positionMillis,
                            durationMillis
                          } = playbackStatus;
                          const progress = positionMillis / durationMillis;
                          this.setState({
                            playbackProgress: progress
                          });
                          if (playbackStatus.didJustFinish) {
                            await this.sound.unloadAsync();
                            this.setState({ isPlaying: false });
                          }
                        }
                      );
                      await this.sound.playAsync();
                    } else {
                      this._startRecording();
                    }
                  }}
                  onTouchEnd={() => {
                    this.state.isRecording && this._stopRecording();
                  }}
                >
                  {this.state.uploaded &&
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
              </View>
              <Button
                backgroundColor={colors.secondary}
                raised
                large
                buttonStyle={styles.button}
                disabledStyle={styles.buttonDisabled}
                fontWeight="bold"
                borderRadius={Platform.OS === 'ios' ? 30 : 0}
                title="Done!"
                disabled={!this.state.uploaded}
                onPress={() => {
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
              <TouchableOpacity onPress={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}>
                <View style={{ opacity: 0.5, flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
                  <Icon name='ios-close-circle' type='ionicon' size={30} color={colors.white} />
                  <Text style={{ color: colors.white, fontSize: 12 }}>Cancel</Text>
                </View>
              </TouchableOpacity>
            </KeyboardAvoidingView>
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
