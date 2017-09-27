import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { BlurView } from 'expo';
import { Separator } from '../components';
import {
  getDictionaries,
  shouldShowDictionariesSelectorModal
} from '../reducers/selectors';
import styles from '../styles';
import colors from '../styles/colors';
import store from '../store';
import {
  ADD_DICTIONARY,
  SELECT_DICTIONARY,
  TOGGLE_DICTIONARY_SELECTOR
} from '../actions/types';
import { smartFontSize } from '../utils/functions';

class DictionarySelectorModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: ''
    };
  }

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.visible}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          onKeyboardChange={event => {
            this.flatlist.scrollToEnd();
          }}
        >
          <BlurView
            tint="dark"
            intensity={100}
            style={[styles.modalContainer, { padding: 0, marginTop: 20 }]}
          >
            <View
              style={{
                backgroundColor: colors.secondary,
                height: 44,
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ fontSize: 17, color: colors.white }}>Choose</Text>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  height: 44,
                  alignItems: 'center',
                  paddingRight: 10
                }}
                onPress={() =>
                  store.dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })}
              >
                <Text
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 10,
                    fontSize: 17,
                    lineHeight: 44,
                    color: colors.primary_dark
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              ref={item => {
                this.flatlist = item;
              }}
              style={styles.flatlist}
              contentContainerStyle={{ backgroundColor: 'transparent' }}
              data={this.props.dictionaries}
              keyExtractor={item => item.name}
              renderItem={({ item }) => (
                <TouchableHighlight
                  underlayColor="rgba(0, 0, 0, 0.2)"
                  activeOpacity={1}
                  onPress={() =>
                    store.dispatch({
                      type: SELECT_DICTIONARY,
                      name: item.name
                    })}
                >
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 10,
                      paddingHorizontal: 20,
                      height: 40,
                      borderBottomWidth: 1,
                      borderColor: 'rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    <Text
                      style={{
                        color: colors.white,
                        fontSize: smartFontSize({
                          min: 14,
                          max: 18,
                          threshold: 25,
                          text: item.name
                        })
                      }}
                      numberOfLines={2}
                    >
                      {item.name}
                    </Text>
                    {item.selected && (
                      <Icon
                        name="ios-checkmark"
                        type="ionicon"
                        size={30}
                        color={colors.white}
                        style={{ position: 'relative', top: 2 }}
                      />
                    )}
                  </View>
                </TouchableHighlight>
              )}
              ListFooterComponent={
                <TextInput
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: smartFontSize({
                      max: 18,
                      min: 14,
                      threshold: 25,
                      text: this.state.text
                    }),
                    color: '#eee',
                    padding: 10,
                    paddingHorizontal: 20
                  }}
                  underlineColorAndroid="transparent"
                  selectionColor="#888"
                  autoCorrect={false}
                  value={this.state.text}
                  onChangeText={text => this.setState({ text })}
                  onSubmitEditing={() => {
                    store.dispatch({
                      type: ADD_DICTIONARY,
                      name: this.state.text
                    });
                    this.setState({ text: '' });
                  }}
                  onFocus={() => {
                    console.log('onFocus');
                    setTimeout(() => this.flatlist.scrollToEnd(), 100);
                  }}
                  placeholder="Add new dictionary..."
                  placeholderTextColor="#888"
                />
              }
              getItemLayout={(data, index) => ({
                length: 40,
                offset: 40 * index,
                index
              })}
            />
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowDictionariesSelectorModal(state),
    dictionaries: getDictionaries(state)
  };
}

export default connect(mapStateToProps)(DictionarySelectorModal);
