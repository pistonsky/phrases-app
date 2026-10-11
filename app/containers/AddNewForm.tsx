import React, { useContext, useEffect, useRef, useState } from 'react'
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
import { Icon as RneIcon } from '@rneui/base'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import * as RNFS from '@dr.pogodin/react-native-fs'
import { createSound } from 'react-native-nitro-sound'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
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
import I18n from 'app/utils/i18n'
import screenInsets from 'app/utils/insets'

const Icon: any = RneIcon

const SCREEN_WIDTH = Dimensions.get('window').width
const RECORDING_PATH = `${RNFS.DocumentDirectoryPath}/recording.mp4`

const AddNewForm = ({
  haveRecordingPermissions,
  originalPhrase,
  translatedPhrase,
  currentDictionary,
  currentPage,
}) => {
  const insets = useContext(SafeAreaInsetsContext)
  const [state, setState] = useState({
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
  })
  const stateRef = useRef(state)
  stateRef.current = state
  const animated = useRef({
    recordButtonScale: new Animated.Value(1),
  }).current
  const sound = useRef(createSound()).current
  const scrollView = useRef<any>(null)
  const textInput1 = useRef<any>(null)
  const textInput2 = useRef<any>(null)
  const progressInterval = useRef<any>(null)
  const recordingStartTime = useRef<any>(null)
  const permissionsRef = useRef(haveRecordingPermissions)
  permissionsRef.current = haveRecordingPermissions

  const patch = update => setState(prev => ({ ...prev, ...update }))

  const prepareRecording = () => {
    // nothing to prepare: the recorder is set up when recording starts
  }

  const checkPermissionsAsync = async () => {
    const status = await request(PERMISSIONS.IOS.MICROPHONE)
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED })
      prepareRecording()
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED })
    }
  }

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      const { appState, permissionsStage } = stateRef.current
      if (appState.match(/inactive|background/) && nextAppState === 'active' && permissionsStage === 1) {
        checkPermissionsAsync()
      }
      patch({ appState: nextAppState })
    })
    if (haveRecordingPermissions !== undefined) {
      // undefined means we never asked for mic yet
      checkPermissionsAsync()
    }
    scrollView.current.scrollTo({
      x: SCREEN_WIDTH * currentPage,
      y: 0,
      animated: false,
    })

    if (haveRecordingPermissions) {
      prepareRecording()
    }
    return () => {
      subscription.remove()
    }
    // mount and unmount only, matching the class lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const askForPermissions = async () => {
    if (Platform.OS === 'ios') {
      if (permissionsRef.current !== undefined) {
        // consequent permissions request won't work on ios - have to send user to Settings
        patch({ permissionsStage: 1 })
        Linking.openURL('App-prefs:root=Privacy&path=MICROPHONE')
      } else {
        const status = await request(PERMISSIONS.IOS.MICROPHONE)
        if (status === 'granted') {
          store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED })
          prepareRecording()
        } else {
          store.dispatch({ type: RECORDING_PERMISSIONS_DENIED })
        }
      }
    }
  }

  const startRecording = () => {
    const onRecordingStarted = () => {
      patch({ isRecording: true })
      Animated.timing(animated.recordButtonScale, {
        toValue: 1.5,
        duration: 200,
        useNativeDriver: true,
      }).start()
      recordingStartTime.current = new Date()
      progressInterval.current = setInterval(() => {
        patch({ recordingDuration: (Number(new Date()) - Number(recordingStartTime.current)) / 1000 })
      }, 100)
    }
    sound
      .startRecorder(RECORDING_PATH)
      .catch(e => console.log('startRecorder failed', e))
      .then(onRecordingStarted)
  }

  const stopRecording = () => {
    clearInterval(progressInterval.current)
    patch({ isRecording: false, recorded: true })
    Animated.timing(animated.recordButtonScale, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start()
    sound.stopRecorder().then(
      () => {
        patch({ recordingDuration: (Number(new Date()) - Number(recordingStartTime.current)) / 1000 })
        sound.startPlayer(RECORDING_PATH)
      },
      e => console.log('stopRecorder failed', e),
    )
  }

  const resetRecording = () => {
    patch({ uploaded: false, recordingDuration: 0, recorded: false })
  }

  const submit = async () => {
    const uri = Math.random()
      .toString(36)
      .slice(2)
    await RNFS.moveFile(RECORDING_PATH, `${RNFS.DocumentDirectoryPath}/${uri}.mp4`)
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

  const play = async () => {
    patch({ isPlaying: true })
    sound.addPlayBackListener(({ currentPosition, duration }) => {
      let currentProgress = Math.max(0, currentPosition) / duration
      if (Number.isNaN(currentProgress)) {
        currentProgress = 0
      }
      patch({ playbackProgress: currentProgress })
    })
    sound.addPlaybackEndListener(() => {
      sound.removePlayBackListener()
      sound.removePlaybackEndListener()
      patch({ isPlaying: false, playbackProgress: 0 })
    })
    await sound.startPlayer(RECORDING_PATH)
  }

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
  } = state

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={{ flex: 1 }}
        ref={scrollView}
        onScroll={({
          nativeEvent: {
            contentOffset: { x },
          },
        }) => {
          const page = Math.ceil(x / SCREEN_WIDTH)
          store.dispatch({ type: FORM_SCROLL_TO_PAGE, page })
          if (haveRecordingPermissions === undefined && page === 2) {
            askForPermissions() // ask for recording permissions when user first sees recording page
          }
          if (page === 0) {
            textInput1.current.focus()
          }
          if (page === 1) {
            textInput2.current.focus()
          }
          if (page === 2) {
            Keyboard.dismiss()
          }
        }}
      >
        <KeyboardAvoidingView {...({ behavior: Platform.OS === 'ios' ? 'padding' : 'height', style: styles.formSlide } as any)}>
          <Text style={styles.formHeader}>{`${I18n.t('Original')}:`}</Text>
          <TextInput
            value={originalPhrase}
            onChangeText={text => store.dispatch({ type: FORM_ORIGINAL_CHANGED, payload: text })}
            autoFocus={currentPage === 0}
            onSubmitEditing={() => {
              scrollView.current.scrollTo({
                x: SCREEN_WIDTH,
                y: 0,
                animated: true,
              })
              textInput2.current.focus()
            }}
            textInputRef={e => {
              textInput1.current = e
            }}
          />
          <Button
            title={I18n.t('Next')}
            onPress={() => {
              scrollView.current.scrollTo({
                x: SCREEN_WIDTH,
                y: 0,
                animated: true,
              })
            }}
          />
        </KeyboardAvoidingView>

        <KeyboardAvoidingView {...({ behavior: Platform.OS === 'ios' ? 'padding' : 'height', style: styles.formSlide } as any)}>
          <Text style={styles.formHeader}>{`${I18n.t('Translated')}:`}</Text>
          <TextInput
            value={translatedPhrase}
            autoFocus={currentPage === 1}
            onChangeText={text =>
              store.dispatch({
                type: FORM_TRANSLATED_CHANGED,
                payload: text,
              })
            }
            onSubmitEditing={() => {
              scrollView.current.scrollTo({
                x: SCREEN_WIDTH * 2,
                y: 0,
                animated: true,
              })
            }}
            textInputRef={e => {
              textInput2.current = e
            }}
          />
          <Button
            title={I18n.t('Next')}
            onPress={() => {
              scrollView.current.scrollTo({
                x: SCREEN_WIDTH * 2,
                y: 0,
                animated: true,
              })
            }}
          />
        </KeyboardAvoidingView>

        {haveRecordingPermissions === false && !checkingPermissions ? (
          <NoPermissionsSlide
            onPress={() => askForPermissions()}
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
            animated={animated}
            onTouchStart={async () => {
              if (recorded) {
                play()
              } else if (isRecording) {
                stopRecording()
              } else {
                startRecording()
              }
            }}
            onTouchEnd={() => {
              isRecording && recordingDuration > 0 && stopRecording()
            }}
            onDone={() => submit()}
            onReset={() => resetRecording()}
          />
        )}
      </ScrollView>
      <FadingView
        visible={currentPage !== 2}
        style={{
          position: 'absolute',
          top: screenInsets(insets).top + 20,
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
            <Icon name="close-circle" type="ionicon" size={30} color={colors.white} />
            <Text
              style={{
                color: colors.white,
                backgroundColor: 'transparent',
                fontSize: 12,
              }}
            >
              {I18n.t('Cancel')}
            </Text>
          </View>
        </TouchableOpacity>
      </FadingView>
    </View>
  )
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
