import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  TouchableHighlight,
  TouchableOpacity,
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  LayoutAnimation,
  NativeModules,
  Image
} from 'react-native';
import { Audio, BlurView, FileSystem } from 'expo';
import { Icon } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { RecButton } from '../components';
import {
  shouldShowPhraseModal,
  getOpenedPhrase,
  isPlayAllMode,
  getNextPhrase
} from '../reducers/selectors';
import {
  CLOSE_PHRASE_MODAL,
  PLAY_PHRASE,
  UPDATE_PHRASE,
  UPDATE_PHRASE_KEEP_MODAL_OPEN,
  OPEN_PHRASE
} from '../actions/types';
import { smartFontSize } from '../utils/functions';
import * as styles from '../styles/phraseModalStyles';
import colors from '../styles/colors';
import store from '../store';

const { UIManager } = NativeModules;

UIManager.setLayoutAnimationEnabledExperimental &&
  UIManager.setLayoutAnimationEnabledExperimental(true);

class PhraseModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      original_editable: false,
      original: '',
      translated_editable: false,
      translated: '',
      audio_modified: false,
      audio: null
    };
  }

  componentWillReceiveProps(nextProps) {
    if (
      nextProps.visible &&
      (!this.props.visible || this.props.phrase.uri !== nextProps.phrase.uri) &&
      (nextProps.phrase !== null)
    ) {
      // overwrite only when modal is opened or "play all" is going on
      this.setState({
        original: nextProps.phrase.original,
        translated: nextProps.phrase.translated,
        original_editable: false,
        translated_editable: false,
        audio_modified: nextProps.phrase.recorded === false,
        audio: null
      });
    }
  }

  render() {
    const { original, translated } = this.state;

    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.props.visible}
        onRequestClose={() => {
          store.dispatch({ type: CLOSE_PHRASE_MODAL });
        }}
      >
        <BlurView tint="dark" intensity={100} style={styles.container}>
          <View style={styles.topContainer} />
          <View style={styles.centerContainer}>
            {this.state.original_editable ? (
              <View style={styles.originalContainer}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }}
                >
                  <Text
                    style={{
                      fontSize: smartFontSize({
                        max: 35,
                        min: 20,
                        threshold: 14,
                        text: this.state.original
                      }),
                      fontWeight: 'normal',
                      color: 'transparent',
                      textAlign: 'center',
                      paddingHorizontal: 10
                    }}
                    onLayout={({ nativeEvent: { layout: { height } } }) => {
                      if (this.state.original_height !== height) {
                        this.setState({ original_height: height });
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
                      text: this.state.original
                    }),
                    color: '#eee',
                    width: '100%',
                    height: Math.max(20, this.state.original_height || 0),
                    textAlign: 'center',
                    paddingHorizontal: 10
                  }}
                  multiline={true}
                  blurOnSubmit={true}
                  returnKeyType="done"
                  underlineColorAndroid="transparent"
                  selectionColor="#888"
                  autoCorrect={false}
                  autoFocus={true}
                  enablesReturnKeyAutomatically={true}
                  value={this.state.original}
                  onChangeText={original => {
                    this.setState({ original });
                  }}
                  onSubmitEditing={() => {
                    LayoutAnimation.spring();
                    this.setState({ original_editable: false });
                  }}
                  onBlur={() => {
                    LayoutAnimation.spring();
                    this.setState({ original_editable: false });
                  }}
                />
              </View>
            ) : (
              <View style={styles.originalContainer}>
                <TouchableHighlight
                  activeOpacity={this.props.play_all_mode ? 1 : 0.5}
                  underlayColor={
                    this.props.play_all_mode ? 'transparent' : colors.white
                  }
                  onPress={() => {
                    if (!this.props.play_all_mode) {
                      LayoutAnimation.spring();
                      this.setState({ original_editable: true });
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
                        text: this.state.original
                      }),
                      fontWeight: 'normal',
                      color: '#eee',
                      textAlign: 'center',
                      paddingHorizontal: 10
                    }}
                  >
                    {original}
                  </Text>
                </TouchableHighlight>
              </View>
            )}
            {this.props.play_all_mode && (
              <View
                style={{
                  width: 100,
                  height: 100,
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Image
                  style={{ width: 80, height: 80 }}
                  source={require('../assets/icons/loading.png')}
                />
              </View>
            )}
            {!this.props.play_all_mode &&
              !this.state.original_editable &&
              !this.state.translated_editable && (
                <View style={styles.playContainer}>
                  {this.state.audio_modified ? (
                    <RecButton
                      ref={ref => {
                        this.recButton = ref;
                      }}
                      size={100}
                      onStopRecording={() =>
                        this.setState({ audio: this.recButton.recording })}
                    />
                  ) : (
                    <TouchableOpacity
                      onPress={() =>
                        store.dispatch({
                          type: PLAY_PHRASE,
                          phrase: this.props.phrase
                        })}
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
                    {(!this.state.audio_modified || this.state.audio) && (
                        <TouchableOpacity
                          onPress={() => {
                            if (this.state.audio_modified) {
                              this.recButton.reset();
                            }
                            this.setState({
                              audio_modified: true,
                              audio: null
                            });
                          }}
                        >
                          <View
                            style={{
                              alignItems: 'center',
                              justifyContent: 'center',
                              position: 'relative',
                              top: 10
                            }}
                          >
                            <Icon
                              name="ios-refresh-circle"
                              type="ionicon"
                              size={40}
                              color={colors.white}
                            />
                            <Text style={[styles.iconLabel, { marginTop: -2 }]}>
                              Reset
                            </Text>
                          </View>
                        </TouchableOpacity>
                      )}
                  </View>
                </View>
              )}
            {this.state.translated_editable ? (
              <View style={styles.originalContainer}>
                <View
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                  }}
                >
                  <Text
                    style={{
                      fontSize: smartFontSize({
                        max: 35,
                        min: 20,
                        threshold: 14,
                        text: this.state.translated
                      }),
                      fontWeight: 'normal',
                      color: 'transparent',
                      textAlign: 'center',
                      paddingHorizontal: 10
                    }}
                    onLayout={({ nativeEvent: { layout: { height } } }) => {
                      if (this.state.translated_height !== height) {
                        this.setState({ translated_height: height });
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
                      text: this.state.translated
                    }),
                    color: '#eee',
                    textAlign: 'center',
                    width: '100%',
                    height: Math.max(20, this.state.translated_height || 0),
                    paddingHorizontal: 10
                  }}
                  multiline={true}
                  blurOnSubmit={true}
                  returnKeyType="done"
                  underlineColorAndroid="transparent"
                  selectionColor="#888"
                  autoCorrect={false}
                  autoFocus={true}
                  enablesReturnKeyAutomatically={true}
                  value={this.state.translated}
                  onChangeText={translated => {
                    this.setState({ translated });
                  }}
                  onSubmitEditing={() => {
                    LayoutAnimation.spring();
                    this.setState({ translated_editable: false });
                  }}
                  onBlur={() => {
                    LayoutAnimation.spring();
                    this.setState({ translated_editable: false });
                  }}
                />
              </View>
            ) : (
              <View style={styles.originalContainer}>
                <TouchableHighlight
                  activeOpacity={this.props.play_all_mode ? 1 : 0.5}
                  underlayColor={
                    this.props.play_all_mode ? 'transparent' : colors.white
                  }
                  onPress={() => {
                    if (!this.props.play_all_mode) {
                      LayoutAnimation.spring();
                      this.setState({ translated_editable: true });
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
                        text: this.state.translated
                      }),
                      fontWeight: 'normal',
                      color: '#eee',
                      textAlign: 'center',
                      paddingHorizontal: 10
                    }}
                  >
                    {translated}
                  </Text>
                </TouchableHighlight>
              </View>
            )}
          </View>
          <View style={styles.bottomContainer}>
            {!this.props.play_all_mode && (
              <TouchableOpacity
                onPress={() => store.dispatch({ type: CLOSE_PHRASE_MODAL })}
              >
                <View style={styles.cancelContainer}>
                  <Icon
                    name="ios-close-circle"
                    type="ionicon"
                    size={50}
                    color={colors.white}
                  />
                  <Text style={styles.iconLabel}>Cancel</Text>
                </View>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={async () => {
                if (this.props.play_all_mode) {
                  store.dispatch({ type: CLOSE_PHRASE_MODAL });
                } else {
                  if (this.state.audio_modified && this.state.audio) {
                    await FileSystem.moveAsync({
                      from: this.state.audio.getURI(),
                      to:
                        FileSystem.documentDirectory +
                        this.props.phrase.uri +
                        '.caf'
                    });
                    store.dispatch({
                      type: UPDATE_PHRASE,
                      phrase: this.props.phrase,
                      update: { original, translated, recorded: true },
                      audio_modified: true
                    });
                  } else {
                    store.dispatch({
                      type: UPDATE_PHRASE,
                      phrase: this.props.phrase,
                      update: { original, translated }
                    });
                  }
                }
              }}
            >
              <View style={[styles.cancelContainer, { opacity: 1 }]}>
                <Icon
                  name="ios-checkmark-circle"
                  type="ionicon"
                  size={50}
                  color={colors.secondary}
                />
                <Text style={styles.iconLabel}>Done</Text>
              </View>
            </TouchableOpacity>
            {!this.props.play_all_mode && this.props.next_phrase && (
              <TouchableOpacity
                onPress={async () => {
                  if (this.state.audio_modified && this.state.audio) {
                    await FileSystem.moveAsync({
                      from: this.state.audio.getURI(),
                      to:
                        FileSystem.documentDirectory +
                        this.props.phrase.uri +
                        '.caf'
                    });
                    store.dispatch({
                      type: UPDATE_PHRASE_KEEP_MODAL_OPEN,
                      phrase: this.props.phrase,
                      update: { original, translated, recorded: true },
                      audio_modified: true
                    });
                  } else {
                    store.dispatch({
                      type: UPDATE_PHRASE_KEEP_MODAL_OPEN,
                      phrase: this.props.phrase,
                      update: { original, translated },
                    });
                  }
                  store.dispatch({
                    type: OPEN_PHRASE,
                    phrase: this.props.next_phrase
                  });
                }}
              >
                <View style={styles.cancelContainer}>
                  <Icon
                    name="ios-arrow-dropright-circle"
                    type="ionicon"
                    size={50}
                    color={colors.secondary}
                  />
                  <Text style={styles.iconLabel}>Next</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowPhraseModal(state),
    phrase: getOpenedPhrase(state),
    next_phrase: getNextPhrase(state),
    play_all_mode: isPlayAllMode(state)
  };
}

export default connect(mapStateToProps)(PhraseModal);
