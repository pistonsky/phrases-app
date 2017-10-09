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
  NativeModules
} from 'react-native';
import { Audio, BlurView, FileSystem } from 'expo';
import { Icon } from 'react-native-elements';
import { FontAwesome } from '@expo/vector-icons';
import { RecButton } from '../components';
import { shouldShowPhraseModal, getOpenedPhrase } from '../reducers/selectors';
import {
  CLOSE_PHRASE_MODAL,
  PLAY_PHRASE,
  UPDATE_PHRASE
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
    if (!this.props.visible && nextProps.visible) {
      // overwrite only when modal is opened
      this.setState({
        original: nextProps.phrase.original,
        translated: nextProps.phrase.translated,
        audio_modified: false,
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
            <View style={styles.originalContainer}>
              {this.state.original_editable ? (
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
                    textAlign: 'center',
                    width: '100%',
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
              ) : (
                <TouchableHighlight
                  activeOpacity={0.5}
                  underlayColor={colors.white}
                  onPress={() => {
                    LayoutAnimation.spring();
                    this.setState({ original_editable: true });
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
              )}
            </View>
            {!this.state.original_editable &&
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
            <View style={styles.originalContainer}>
              {this.state.translated_editable ? (
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
              ) : (
                <TouchableHighlight
                  activeOpacity={0.1}
                  underlayColor={colors.white}
                  onPress={() => {
                    LayoutAnimation.spring();
                    this.setState({ translated_editable: true });
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
              )}
            </View>
          </View>
          <View style={styles.bottomContainer}>
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
                    type: UPDATE_PHRASE,
                    phrase: this.props.phrase,
                    update: { original, translated },
                    audio_modified: true
                  });
                } else {
                  store.dispatch({
                    type: UPDATE_PHRASE,
                    phrase: this.props.phrase,
                    update: { original, translated }
                  });
                }
              }}
            >
              <View style={styles.cancelContainer}>
                <Icon
                  name="ios-checkmark-circle"
                  type="ionicon"
                  size={50}
                  color={colors.secondary}
                />
                <Text style={styles.iconLabel}>Done</Text>
              </View>
            </TouchableOpacity>
          </View>
        </BlurView>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowPhraseModal(state),
    phrase: getOpenedPhrase(state)
  };
}

export default connect(mapStateToProps)(PhraseModal);
