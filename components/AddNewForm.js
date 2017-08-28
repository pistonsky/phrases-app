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
import { getRecordingPermissions } from '../reducers/selectors';
import {
  RECORDING_PERMISSIONS_DENIED,
  RECORDING_PERMISSIONS_GRANTED
} from '../actions/types';
import store from '../store';

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

  _askForPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
  };

  _startRecording = async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        allowsRecordingIOS: true,
        interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_MIX_WITH_OTHERS,
        shouldDuckAndroid: true,
        interruptionModeAndroid: Audio.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS
      });
      this.recording = new Audio.Recording();
      await this.recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
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
  };

  _stopRecording = async () => {
    await this.recording.stopAndUnloadAsync();
    const uri = this.recording.getURI();
    this.setState({ isRecording: false });
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    clearInterval(this._interval);
    const { sound, status } = await this.recording.createNewLoadedSound();
    await sound.playAsync();
  };

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

          {!this.props.haveRecordingPermissions
            ? <View style={styles.slide}>
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
            : <KeyboardAvoidingView behavior="padding" style={styles.slide}>
                <Animated.Text style={styles.header}>
                  {this.state.recordingDuration === 0
                    ? 'Диктуй!'
                    : this.state.recordingDuration.toFixed(2)}
                </Animated.Text>
                <Animated.View
                  style={{
                    ...styles.recordButton,
                    transform: [{ scale: this.animated.recordButtonScale }]
                  }}
                  onTouchStart={() => {
                    this._startRecording();
                  }}
                  onTouchEnd={() => {
                    this._stopRecording();
                  }}
                />
                <Button
                  backgroundColor="#fa4"
                  raised
                  large
                  buttonStyle={styles.button}
                  fontWeight="bold"
                  borderRadius={30}
                  title="Готово!"
                />
              </KeyboardAvoidingView>}
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
    margin: 50,
    backgroundColor: 'transparent',
    color: '#eee',
    fontSize: 70,
    textAlign: 'center'
  },
  button: {
    width: 200,
    height: 50
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    margin: 50,
    backgroundColor: '#f00'
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
    haveRecordingPermissions: getRecordingPermissions(state)
  };
}

export default connect(mapStateToProps)(AddNewForm);
