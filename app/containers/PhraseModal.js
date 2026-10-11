import React, { Component } from 'react'
import { connect } from 'react-redux'
import {
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  LayoutAnimation,
  Image,
} from 'react-native'
import { BlurView } from '@sbaiahmed1/react-native-blur'
import * as RNFS from '@dr.pogodin/react-native-fs'
import { Icon } from '@rneui/base'
import FontAwesome from '@react-native-vector-icons/fontawesome'
import { RecButton } from 'app/components'
import { shouldShowPhraseModal, getOpenedPhrase, isPlayAllMode, getNextPhrase } from 'app/reducers/selectors'
import {
  CLOSE_PHRASE_MODAL,
  PLAY_PHRASE,
  UPDATE_PHRASE,
  UPDATE_PHRASE_KEEP_MODAL_OPEN,
  OPEN_PHRASE,
  AUDIO_CACHED,
} from 'app/actions/types'
import { smartFontSize } from 'app/utils/functions'
import * as styles from 'app/styles/phraseModalStyles'
import colors from 'app/styles/colors'
import { store } from 'app/redux'
import I18n from 'app/utils/i18n'

class PhraseModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      original_editable: false,
      original: '',
      original_modified: false,
      translated_editable: false,
      translated: '',
      translated_modified: false,
      audio_modified: false,
      audio: null,
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { visible, phrase } = this.props
    if (nextProps.visible && (!visible || phrase.uri !== nextProps.phrase.uri) && nextProps.phrase !== null) {
      // overwrite only when modal is opened or "play all" is going on
      this.setState({
        original: nextProps.phrase.original,
        translated: nextProps.phrase.translated,
        original_editable: false,
        translated_editable: false,
        original_modified: false,
        translated_modified: false,
        audio_modified: nextProps.phrase.recorded === false,
        audio: null,
      })
    }
  }

  // Puts the new recording where the sync saga uploads the phrase's audio from
  async _saveRecording() {
    const { phrase } = this.props
    const { audio } = this.state
    const localUri = `${RNFS.DocumentDirectoryPath}/${phrase.uri}.mp4`
    // moveFile won't replace the old recording
    if (await RNFS.exists(localUri)) {
      await RNFS.unlink(localUri)
    }
    await RNFS.moveFile(audio, localUri)
    // the old audio may be cached under another name (older phrases were recorded as .caf)
    store.dispatch({ type: AUDIO_CACHED, uri: phrase.uri, localUri })
  }

  render() {
    const { visible, play_all_mode, phrase, next_phrase } = this.props
    const {
      original,
      translated,
      original_editable,
      translated_editable,
      original_modified,
      translated_modified,
      original_height,
      translated_height,
      audio,
      audio_modified,
    } = this.state

    return (
      <Modal
        animationType="none"
        transparent
        visible={visible}
        onRequestClose={() => {
          store.dispatch({ type: CLOSE_PHRASE_MODAL })
        }}
      >
        <BlurView blurType="dark" blurAmount={100} style={styles.container}>
          <View style={styles.topContainer} />
          <View style={styles.centerContainer}>
            {original_editable ? (
              <View style={styles.originalContainer}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: smartFontSize({
                        max: 35,
                        min: 20,
                        threshold: 14,
                        text: original,
                      }),
                      fontWeight: 'normal',
                      color: 'transparent',
                      textAlign: 'center',
                      paddingHorizontal: 10,
                    }}
                    onLayout={({
                      nativeEvent: {
                        layout: { height },
                      },
                    }) => {
                      if (original_height !== height) {
                        this.setState({ original_height: height })
                      }
                    }}
                  >
                    {original}
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: smartFontSize({
                      max: 35,
                      min: 20,
                      threshold: 14,
                      text: original,
                    }),
                    color: '#eee',
                    width: '100%',
                    height: Math.max(20, original_height || 0),
                    textAlign: 'center',
                    paddingHorizontal: 10,
                  }}
                  multiline
                  blurOnSubmit
                  returnKeyType="done"
                  underlineColorAndroid="transparent"
                  selectionColor="#888"
                  autoCorrect={false}
                  autoFocus
                  enablesReturnKeyAutomatically
                  value={original}
                  onChangeText={text => {
                    this.setState({ original: text, original_modified: true })
                  }}
                  onSubmitEditing={() => {
                    LayoutAnimation.spring()
                    this.setState({ original_editable: false })
                  }}
                  onBlur={() => {
                    LayoutAnimation.spring()
                    this.setState({ original_editable: false })
                  }}
                />
              </View>
            ) : (
              <View style={styles.originalContainer}>
                <TouchableHighlight
                  activeOpacity={play_all_mode ? 1 : 0.5}
                  underlayColor={play_all_mode ? 'transparent' : colors.white}
                  onPress={() => {
                    if (!play_all_mode) {
                      LayoutAnimation.spring()
                      this.setState({ original_editable: true })
                    }
                  }}
                  style={styles.touchable}
                >
                  <Text
                    style={{
                      fontSize: smartFontSize({
                        max: 35,
                        min: 20,
                        threshold: 14,
                        text: original,
                      }),
                      fontWeight: 'normal',
                      color: '#eee',
                      textAlign: 'center',
                      paddingHorizontal: 10,
                    }}
                  >
                    {original}
                  </Text>
                </TouchableHighlight>
              </View>
            )}
            {play_all_mode && (
              <View
                style={{
                  width: 100,
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Image style={{ width: 80, height: 80 }} source={require('assets/icons/loading.png')} />
              </View>
            )}
            {!play_all_mode && !original_editable && !translated_editable && (
              <View style={styles.playContainer}>
                {audio_modified ? (
                  <RecButton
                    ref={ref => {
                      this.recButton = ref
                    }}
                    size={100}
                    onStopRecording={path => this.setState({ audio: path })}
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => store.dispatch({ type: PLAY_PHRASE, phrase })}
                    style={{ margin: 5 }}
                  >
                    <FontAwesome
                      name="play-circle-o"
                      size={100}
                      color={colors.secondary}
                      style={{ backgroundColor: 'transparent' }}
                    />
                  </TouchableOpacity>
                )}
                <View style={styles.resetContainer}>
                  {(!audio_modified || audio) && (
                    <TouchableOpacity
                      onPress={() => {
                        if (audio_modified) {
                          this.recButton.reset()
                        }
                        this.setState({
                          audio_modified: true,
                          audio: null,
                        })
                      }}
                    >
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          top: 10,
                        }}
                      >
                        <Icon name="refresh-circle" type="ionicon" size={40} color={colors.white} />
                        <Text style={[styles.iconLabel, { marginTop: -2 }]}>Reset</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            {translated_editable ? (
              <View style={styles.originalContainer}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0,
                  }}
                >
                  <Text
                    style={{
                      fontSize: smartFontSize({
                        max: 35,
                        min: 20,
                        threshold: 14,
                        text: translated,
                      }),
                      fontWeight: 'normal',
                      color: 'transparent',
                      textAlign: 'center',
                      paddingHorizontal: 10,
                    }}
                    onLayout={({
                      nativeEvent: {
                        layout: { height },
                      },
                    }) => {
                      if (translated_height !== height) {
                        this.setState({ translated_height: height })
                      }
                    }}
                  >
                    {translated}
                  </Text>
                </View>
                <TextInput
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: smartFontSize({
                      max: 35,
                      min: 20,
                      threshold: 14,
                      text: translated,
                    }),
                    color: '#eee',
                    textAlign: 'center',
                    width: '100%',
                    height: Math.max(20, translated_height || 0),
                    paddingHorizontal: 10,
                  }}
                  multiline
                  blurOnSubmit
                  returnKeyType="done"
                  underlineColorAndroid="transparent"
                  selectionColor="#888"
                  autoCorrect={false}
                  autoFocus
                  enablesReturnKeyAutomatically
                  value={translated}
                  onChangeText={text => {
                    this.setState({ translated: text, translated_modified: true })
                  }}
                  onSubmitEditing={() => {
                    LayoutAnimation.spring()
                    this.setState({ translated_editable: false })
                  }}
                  onBlur={() => {
                    LayoutAnimation.spring()
                    this.setState({ translated_editable: false })
                  }}
                />
              </View>
            ) : (
              <View style={styles.originalContainer}>
                <TouchableHighlight
                  activeOpacity={play_all_mode ? 1 : 0.5}
                  underlayColor={play_all_mode ? 'transparent' : colors.white}
                  onPress={() => {
                    if (!play_all_mode) {
                      LayoutAnimation.spring()
                      this.setState({ translated_editable: true })
                    }
                  }}
                  style={styles.touchable}
                >
                  <Text
                    style={{
                      fontSize: smartFontSize({
                        max: 35,
                        min: 20,
                        threshold: 14,
                        text: translated,
                      }),
                      fontWeight: 'normal',
                      color: '#eee',
                      textAlign: 'center',
                      paddingHorizontal: 10,
                    }}
                  >
                    {translated}
                  </Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
          <View style={styles.bottomContainer}>
            {!play_all_mode && (
              <TouchableOpacity onPress={() => store.dispatch({ type: CLOSE_PHRASE_MODAL })}>
                <View style={styles.cancelContainer}>
                  <Icon name="close-circle" type="ionicon" size={50} color={colors.white} />
                  <Text style={styles.iconLabel}>{I18n.t('Cancel')}</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={async () => {
                if (play_all_mode) {
                  store.dispatch({ type: CLOSE_PHRASE_MODAL })
                } else if (audio_modified && audio) {
                  await this._saveRecording()
                  store.dispatch({
                    type: UPDATE_PHRASE,
                    phrase,
                    update: { original, translated, recorded: true },
                    audio_modified: true,
                  })
                } else if (original_modified || translated_modified) {
                  store.dispatch({
                    type: UPDATE_PHRASE,
                    phrase,
                    update: { original, translated },
                  })
                } else {
                  store.dispatch({ type: CLOSE_PHRASE_MODAL })
                }
              }}
            >
              <View style={[styles.cancelContainer, { opacity: 1 }]}>
                <Icon name="checkmark-circle" type="ionicon" size={50} color={colors.secondary} />
                <Text style={styles.iconLabel}>{I18n.t('Done')}</Text>
              </View>
            </TouchableOpacity>
            {!play_all_mode && next_phrase && (
              <TouchableOpacity
                onPress={async () => {
                  if (audio_modified && audio) {
                    await this._saveRecording()
                    store.dispatch({
                      type: UPDATE_PHRASE_KEEP_MODAL_OPEN,
                      phrase,
                      update: { original, translated, recorded: true },
                      audio_modified: true,
                    })
                  } else if (original_modified || translated_modified) {
                    store.dispatch({
                      type: UPDATE_PHRASE_KEEP_MODAL_OPEN,
                      phrase,
                      update: { original, translated },
                    })
                  }
                  store.dispatch({
                    type: OPEN_PHRASE,
                    phrase: next_phrase,
                  })
                }}
              >
                <View style={styles.cancelContainer}>
                  <Icon name="caret-forward-circle" type="ionicon" size={50} color={colors.secondary} />
                  <Text style={styles.iconLabel}>{I18n.t('Next')}</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowPhraseModal(state),
    phrase: getOpenedPhrase(state),
    next_phrase: getNextPhrase(state),
    play_all_mode: isPlayAllMode(state),
  }
}

export default connect(mapStateToProps)(PhraseModal)
