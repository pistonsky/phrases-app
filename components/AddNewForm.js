import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  KeyboardAvoidingView,
  View,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  TouchableHighlight
} from 'react-native';
import { Button } from 'react-native-elements';
import { Permissions, Audio } from 'expo';
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
  }

  _askForPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
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
                  x: SCREEN_WIDTH*2,
                  y: 0,
                  animated: true
                });
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
                <Text style={styles.header}>Диктуйте!</Text>
                <TouchableHighlight
                  activeOpacity={0.5}
                  underlayColor="#f00"
                  onPress={this._stopPlaybackAndBeginRecording}
                >
                  <View style={styles.recordButton} />
                </TouchableHighlight>
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
    backgroundColor: '#a00'
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
