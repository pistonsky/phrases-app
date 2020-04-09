import React, { Component } from 'react'
import { connect } from 'react-redux'
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
  Button as ReactNativeButton,
} from 'react-native'
import { Icon } from 'react-native-elements'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import RNFS from 'react-native-fs'
import { Player, Recorder } from '@react-native-community/audio-toolkit'
import axios from 'axios'
import { TextInput, Button, NoPermissionsSlide, RecordingSlide, FadingView } from 'app/components'
import {
  getRecordingPermissions,
  getOriginalPhrase,
  getTranslatedPhrase,
  getCurrentFormPage,
  getUserId,
  getCurrentDictionaryName,
} from 'app/reducers/selectors'
import {
  SHOW_RECORDING_PERMISSIONS_MODAL,
  RECORDING_PERMISSIONS_DENIED,
  RECORDING_PERMISSIONS_GRANTED,
  ADD_NEW_PHRASE,
  FORM_ORIGINAL_CHANGED,
  FORM_TRANSLATED_CHANGED,
  FORM_SCROLL_TO_PAGE,
  CLOSE_ADD_NEW_MODAL,
} from 'app/actions/types'
import { store } from 'app/redux'
import * as config from 'app/utils/config'
import * as api from 'app/api'
import styles from 'app/styles'
import colors from 'app/styles/colors'

const SCREEN_WIDTH = Dimensions.get('window').width

class AddNewForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isRecording: false,
      isUploading: false,
      isPlaying: false,
      recorded: false,
      uploaded: false,
      recordingDuration: 0,
      uploadProgress: 0,
      playbackProgress: 0,
      checkingPermissions: false,
      permissionsStage: 0,
      appState: AppState.currentState,
    }
    this.animated = {
      recordButtonScale: new Animated.Value(1),
    }
    this._handleAppStateChange = this._handleAppStateChange.bind(this)
  }

  componentDidMount() {
    const { haveRecordingPermissions, currentPage } = this.props
    AppState.addEventListener('change', this._handleAppStateChange)
    if (haveRecordingPermissions !== undefined) {
      // undefined means we never asked for mic yet
      this._checkPermissionsAsync()
    }
    this.scrollView.scrollTo({
      x: SCREEN_WIDTH * currentPage,
      y: 0,
      animated: false,
    })

    if (haveRecordingPermissions) {
      this._prepareRecording()
    }
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange)
  }

  _handleAppStateChange(nextAppState) {
    const { appState, permissionsStage } = this.state
    if (appState.match(/inactive|background/) && nextAppState === 'active' && permissionsStage === 1) {
      this._checkPermissionsAsync()
    }
    this.setState({ appState: nextAppState })
  }

  _prepareRecording() {
    this.recorder = new Recorder('recording.mp4')
    this.recorder.prepare()
  }

  async _askForPermissions() {
    const { haveRecordingPermissions } = this.props
    if (Platform.OS === 'ios') {
      if (haveRecordingPermissions !== undefined) {
        // consequent permissions request won't work on ios - have to send user to Settings
        this.setState({ permissionsStage: 1 })
        Linking.openURL('App-prefs:root=Privacy&path=MICROPHONE')
      } else {
        const status = await request(PERMISSIONS.IOS.MICROPHONE)
        if (status === 'granted') {
          store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
          this._prepareRecording();
        } else {
          store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
        }
      }
    }
  }

  _checkPermissionsAsync() {
    // see phrazes
  }

  _startRecording() {
    if (this.recorder.state === -2) { // DESTROYED
      this.recorder = new Recorder('recording.mp4')
      this.recorder.prepare()
    }
    this.recorder.record(() => {
      this.setState({ isRecording: true })
      Animated.timing(this.animated.recordButtonScale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true
      }).start()
      this._recordingStartTime = new Date()
      this._progressInterval = setInterval(() => {
        this.setState({ recordingDuration: (new Date() - this._recordingStartTime) / 1000 })
      }, 100)
    })
  }

  _stopRecording() {
    clearInterval(this._progressInterval)
    this.setState({ isRecording: false, recorded: true })
    Animated.timing(this.animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start()
    this.recorder.stop((err) => {
      if (!err) {
        this.setState({ recordingDuration: (new Date() - this._recordingStartTime) / 1000 })
        this.Player = new Player('recording.mp4')
        this.Player.play()
      }
    })
  }

  _resetRecording() {
    this.setState({ uploaded: false, recordingDuration: 0, recorded: false })
  }

  async _submit() {
    const { originalPhrase, translatedPhrase, currentDictionary } = this.props
    const uri = Math.random()
      .toString(36)
      .slice(2)
    await RNFS.moveFile(`${RNFS.DocumentDirectoryPath}/recording.mp4`, `${RNFS.DocumentDirectoryPath}/${uri}.mp4`)
    const phrase = {
      original: originalPhrase,
      translated: translatedPhrase,
      synced: false,
      uri,
      dictionary: currentDictionary,
    }
    store.dispatch({
      type: ADD_NEW_PHRASE,
      ...phrase,
    })
  }

  async _play() {
    this.setState({ isPlaying: true })
    this.player = new Player('recording.mp4')
    this.player.play()
    this._progressInterval = setInterval(() => {
      if (this.player) {
        let currentProgress = Math.max(0, this.player.currentTime) / this.player.duration;
        if (Number.isNaN(currentProgress)) {
          currentProgress = 0;
        }
        this.setState({ playbackProgress: currentProgress });
        if (this.player.isStopped) {
          this.setState({ isPlaying: false })
          clearInterval(this._progressInterval)
        }
      }
    }, 100);
  }

  render() {
    const { originalPhrase, translatedPhrase, currentPage, haveRecordingPermissions } = this.props
    const {
      isRecording,
      isUploading,
      isPlaying,
      recorded,
      uploaded,
      recordingDuration,
      uploadProgress,
      playbackProgress,
      checkingPermissions,
    } = this.state
    return (
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
          ref={e => {
            this.scrollView = e
          }}
          onScroll={({
            nativeEvent: {
              contentOffset: { x },
            },
          }) => {
            const page = Math.ceil(x / SCREEN_WIDTH)
            store.dispatch({ type: FORM_SCROLL_TO_PAGE, page })
            if (haveRecordingPermissions === undefined && page === 2) {
              this._askForPermissions() // ask for recording permissions when user first sees recording page
            }
            if (page === 0) {
              this._textInput1.focus()
            }
            if (page === 1) {
              this._textInput2.focus()
            }
            if (page === 2) {
              Keyboard.dismiss()
            }
          }}
        >
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formSlide}>
            <Text style={styles.formHeader}>Original:</Text>
            <TextInput
              value={originalPhrase}
              onChangeText={text => store.dispatch({ type: FORM_ORIGINAL_CHANGED, payload: text })}
              autoFocus={currentPage === 0}
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH,
                  y: 0,
                  animated: true,
                })
                this._textInput2.focus()
              }}
              textInputRef={e => {
                this._textInput1 = e
              }}
            />
            <Button
              title="Next"
              onPress={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH,
                  y: 0,
                  animated: true,
                })
              }}
            />
          </KeyboardAvoidingView>

          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.formSlide}>
            <Text style={styles.formHeader}>Translated:</Text>
            <TextInput
              value={translatedPhrase}
              autoFocus={currentPage === 1}
              onChangeText={text => store.dispatch({
                  type: FORM_TRANSLATED_CHANGED,
                  payload: text,
                })}
              onSubmitEditing={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true,
                })
              }}
              textInputRef={e => {
                this._textInput2 = e
              }}
            />
            <Button
              title="Next"
              onPress={() => {
                this.scrollView.scrollTo({
                  x: SCREEN_WIDTH * 2,
                  y: 0,
                  animated: true,
                })
              }}
            />
          </KeyboardAvoidingView>

          {haveRecordingPermissions === false && !checkingPermissions ? (
            <NoPermissionsSlide
              onPress={() => this._askForPermissions()}
              onCancel={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}
            />
          ) : (
            <RecordingSlide
              recordingDuration={recordingDuration}
              isUploading={isUploading}
              isPlaying={isPlaying}
              isRecording={isRecording}
              uploaded={uploaded}
              recorded={recorded}
              uploadProgress={uploadProgress}
              playbackProgress={playbackProgress}
              animated={this.animated}
              onTouchStart={async () => {
                if (recorded) {
                  this._play()
                } else if (isRecording) {
                  this._stopRecording()
                } else {
                  this._startRecording()
                }
              }}
              onTouchEnd={() => {
                isRecording && recordingDuration > 0 && this._stopRecording()
              }}
              onDone={() => this._submit()}
              onReset={() => this._resetRecording()}
            />
          )}
        </ScrollView>
        <FadingView
          visible={currentPage !== 2}
          style={{
            position: 'absolute',
            top: 40,
            left: 0,
            right: 0,
            height: 50,
          }}
        >
          <TouchableOpacity onPress={() => store.dispatch({ type: CLOSE_ADD_NEW_MODAL })}>
            <View
              style={{
                opacity: 0.5,
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Icon name="ios-close-circle" type="ionicon" size={30} color={colors.white} />
              <Text
                style={{
                  color: colors.white,
                  backgroundColor: 'transparent',
                  fontSize: 12,
                }}
              >
                Cancel
              </Text>
            </View>
          </TouchableOpacity>
        </FadingView>
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    haveRecordingPermissions: getRecordingPermissions(state),
    originalPhrase: getOriginalPhrase(state),
    translatedPhrase: getTranslatedPhrase(state),
    currentDictionary: getCurrentDictionaryName(state),
    currentPage: getCurrentFormPage(state),
  }
}

export default connect(mapStateToProps)(AddNewForm)
