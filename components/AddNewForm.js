import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  TouchableHighlight,
  Animated
} from 'react-native';
import { Button } from 'react-native-elements';
import { Permissions, Audio, FileSystem } from 'expo';
import {
  getRecordingPermissions,
  getOriginalPhrase,
  getTranslatedPhrase
} from '../reducers/selectors';
import {
  RECORDING_PERMISSIONS_DENIED,
  RECORDING_PERMISSIONS_GRANTED,
  ADD_NEW_PHRASE,
  FORM_ORIGINAL_CHANGED,
  FORM_TRANSLATED_CHANGED
} from '../actions/types';
import store from '../store';
import * as config from '../utils/config';
import axios from 'axios';
import { Circle as Progress } from 'react-native-progress';
import { FontAwesome } from '@expo/vector-icons';

const SCREEN_WIDTH = Dimensions.get('window').width;

class AddNewForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoading: false,
      isRecording: false,
      recordingDuration: 0
    };
    this.animated = {
      recordButtonScale: new Animated.Value(1)
    };
  }

  async _askForPermissions() {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
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
      try {
        const status = await this.recording.prepareToRecordAsync({
          android: {
            extension: '.3gp',
            outputFormat:
              Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_THREE_GPP,
            audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AMR_NB,
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
        console.log('prepareToRecordAsync: ', status);
      } catch (e) {
        console.log(e);
      }
      await this.recording.startAsync();
      this._interval = setInterval(async () => {
        const status = await this.recording.getStatusAsync();
        if (status.durationMillis)
          this.setState({ recordingDuration: status.durationMillis / 1000 });
      }, 50);
    } catch (e) {
      console.log(e);
    }

    this.setState({ isRecording: true });

    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1.5,
      duration: 200,
      useNativeDriver: true
    }).start();
  }

  async _stopRecording() {
    await this.recording.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
      shouldDuckAndroid: true,
      interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
    });
    const uri = this.recording.getURI();
    this.setState({ isRecording: false });
    this._uploadRecordingAsync(uri);
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    clearInterval(this._interval);
    const { sound, status } = await this.recording.createNewLoadedSound();
    this.sound = sound;
    this.sound.setOnPlaybackStatusUpdate(async playbackStatus => {
      if (playbackStatus.didJustFinish) {
        await this.sound.unloadAsync();
      }
    });
    await this.sound.playAsync();
  }

  async _uploadRecordingAsync(uri) {
    console.log(uri);
    try {
      this.setState({ isUploading: true, uploadProgress: undefined });
      let formData = new FormData();
      formData.append('file', { uri, name: 'audio.caf', type: 'audio/x-caf' });
      const { data } = await axios.post(config.UPLOAD_URL, formData, {
        onUploadProgress: progressEvent => {
          this.setState({
            uploadProgress: progressEvent.loaded / progressEvent.total
          });
        }
      });
      this.sound_uri = data[0].filename;
    } catch (e) {
      console.error(e);
    } finally {
      this.setState({ isUploading: false, uploaded: true });
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
        >
          <KeyboardAvoidingView behavior="padding" style={styles.slide}>
            <Text style={styles.header}>Фраза:</Text>
            <TextInput
              style={styles.textInput}
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
            />
            <Button
              backgroundColor="#fa4"
              raised
              large
              buttonStyle={styles.button}
              fontWeight="bold"
              borderRadius={30}
              title="Дальше"
              onPress={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH,
                  y: 0,
                  animated: true
                });
              }}
            />
          </KeyboardAvoidingView>

          <KeyboardAvoidingView behavior="padding" style={styles.slide}>
            <Text style={styles.header}>Перевод:</Text>
            <TextInput
              value={this.props.translatedPhrase}
              onChangeText={text =>
                store.dispatch({
                  type: FORM_TRANSLATED_CHANGED,
                  payload: text
                })}
              style={styles.textInput}
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true
                });
              }}
              ref={e => {
                this._textInput2 = e;
              }}
            />
            <Button
              backgroundColor="#fa4"
              raised
              large
              buttonStyle={styles.button}
              fontWeight="bold"
              borderRadius={30}
              title="Дальше"
              onPress={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true
                });
              }}
            />
          </KeyboardAvoidingView>

          {!this.props.haveRecordingPermissions ? (
            <View style={styles.slide}>
              <Text style={styles.noPermissionsText}>
                Чувак, разреши сначала доступ к диктофону, ну ё-моё!
              </Text>
              <Button
                backgroundColor="#fa4"
                raised
                large
                buttonStyle={styles.button}
                fontWeight="bold"
                borderRadius={30}
                onPress={this._askForPermissions}
                title="Разрешаю!"
              />
            </View>
          ) : (
            <KeyboardAvoidingView behavior="padding" style={styles.slide}>
              <Animated.Text style={styles.header}>
                {this.state.recordingDuration === 0 ? (
                  'Диктуй!'
                ) : (
                  this.state.recordingDuration.toFixed(2)
                )}
              </Animated.Text>
              <View style={styles.recordButtonContainer}>
                {(this.state.isUploading || this.state.uploaded) && (
                  <Progress
                    style={styles.progress}
                    size={120}
                    thickness={6}
                    color={this.state.uploaded ? '#fa4' : '#f00'}
                    animated={false}
                    unfilledColor="#4af"
                    borderWidth={0}
                    progress={
                      this.state.isUploading ? (
                        this.state.uploadProgress
                      ) : (
                        this.state.playbackProgress
                      )
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
                          console.log(progress);
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
                backgroundColor="#fa4"
                raised
                large
                buttonStyle={styles.button}
                fontWeight="bold"
                borderRadius={30}
                title="Готово!"
                onPress={() => {
                  store.dispatch({
                    type: ADD_NEW_PHRASE,
                    original: this.props.originalPhrase,
                    translated: this.props.translatedPhrase,
                    recording: this.recording,
                    localUri: this.recording.getURI(),
                    uri: this.sound_uri
                  });
                }}
              />
            </KeyboardAvoidingView>
          )}
        </ScrollView>
      </View>
    );
  }
}

const styles = {
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    backgroundColor: '#4af'
  },
  header: {
    textAlign: 'center',
    fontSize: 50,
    color: '#adf'
  },
  textInput: {
    height: 100,
    width: SCREEN_WIDTH,
    margin: 50,
    backgroundColor: 'red',
    color: '#eee',
    fontSize: 70,
    textAlign: 'center'
  },
  button: {
    width: 200,
    height: 50
  },
  recordButtonContainer: {
    width: SCREEN_WIDTH,
    height: 200
  },
  progress: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    marginLeft: -60,
    marginTop: -60
  },
  recordButton: {
    position: 'absolute',
    left: '50%',
    top: '50%',
    width: 100,
    height: 100,
    marginLeft: -50,
    marginTop: -50,
    borderRadius: 50,
    backgroundColor: '#f00',
    justifyContent: 'center',
    alignItems: 'center'
  },
  noPermissionsText: {
    fontSize: 40,
    color: '#fff',
    textAlign: 'center',
    margin: 20
  }
};

function mapStateToProps(state) {
  return {
    haveRecordingPermissions: getRecordingPermissions(state),
    originalPhrase: getOriginalPhrase(state),
    translatedPhrase: getTranslatedPhrase(state)
  };
}

export default connect(mapStateToProps)(AddNewForm);
