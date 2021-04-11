import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Modal, FlatList, TouchableOpacity, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import { ifIphoneX } from 'react-native-iphone-x-helper'
import { DictionaryListItem } from 'app/components'
import { getDictionaries, shouldShowDictionariesSelectorModal, getUserId } from 'app/reducers/selectors'
import styles from 'app/styles'
import colors from 'app/styles/colors'
import { store } from 'app/redux'
import { ADD_DICTIONARY, SELECT_DICTIONARY, TOGGLE_DICTIONARY_SELECTOR } from 'app/actions/types'
import { smartFontSize } from 'app/utils/functions'
import * as actions from 'app/actions'

class DictionarySelectorModal extends Component {
  constructor(props) {
    super(props)
    this.state = {
      text: '',
    }
  }

  render() {
    const { visible, dictionaries, deleteDictionary, copyDictionaryAsTemplate, updateDictionaryName } = this.props
    const { text } = this.state
    return (
      <Modal animationType="slide" transparent visible={visible}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
          onKeyboardChange={() => {
            this.flatlist.scrollToEnd()
          }}
        >
          <BlurView blurType="dark" blurAmount={100} style={[styles.modalContainer, { padding: 0, marginTop: 20 }]}>
            <View
              style={{
                backgroundColor: colors.secondary,
                height: ifIphoneX(60, 40),
                paddingTop: ifIphoneX(20, 0),
                width: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 17, color: colors.white }}>Choose</Text>
              <TouchableOpacity
                style={{
                  position: 'absolute',
                  top: ifIphoneX(20, 0),
                  right: 0,
                  height: 40,
                  alignItems: 'center',
                  paddingRight: 10,
                }}
                onPress={() => store.dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })}
              >
                <Text
                  style={{
                    position: 'absolute',
                    top: 0,
                    right: 10,
                    fontSize: 17,
                    lineHeight: 44,
                    color: colors.primary_dark,
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>
            <FlatList
              ref={item => {
                this.flatlist = item
              }}
              style={styles.flatlist}
              contentContainerStyle={styles.flatListContentContainer}
              data={dictionaries}
              keyExtractor={item => item.name}
              renderItem={({ item, index }) => (
                <DictionaryListItem
                  item={item}
                  onDelete={() => deleteDictionary({ dictionary_name: item.name })}
                  onCopy={() => copyDictionaryAsTemplate({ dictionary_name: item.name })}
                  onPress={() => store.dispatch({ type: SELECT_DICTIONARY, name: item.name })}
                  onChange={newName => updateDictionaryName({ old_name: item.name, new_name: newName })}
                  onFocus={() => {
                    setTimeout(() => this.flatlist.scrollToIndex({ index, viewPosition: 1 }), 100)
                  }}
                />
              )}
              ListFooterComponent={(
                <TextInput
                  style={{
                    backgroundColor: 'transparent',
                    fontSize: smartFontSize({
                      max: 18,
                      min: 14,
                      threshold: 25,
                      text,
                    }),
                    color: '#eee',
                    padding: 10,
                    paddingHorizontal: 20,
                  }}
                  underlineColorAndroid="transparent"
                  selectionColor="#888"
                  autoCorrect={false}
                  value={text}
                  onChangeText={newText => this.setState({ text: newText })}
                  onSubmitEditing={() => {
                    store.dispatch({
                      type: ADD_DICTIONARY,
                      name: text,
                    })
                    this.setState({ text: '' })
                  }}
                  onFocus={() => {
                    setTimeout(() => this.flatlist.scrollToEnd(), 100)
                  }}
                  placeholder="Add new dictionary..."
                  placeholderTextColor="#888"
                />
              )}
              getItemLayout={(data, index) => ({
                length: 40,
                offset: 40 * index,
                index,
              })}
              initialNumToRender={17}
            />
          </BlurView>
        </KeyboardAvoidingView>
      </Modal>
    )
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowDictionariesSelectorModal(state),
    dictionaries: getDictionaries(state),
    user_id: getUserId(state),
  }
}

export default connect(
  mapStateToProps,
  actions,
)(DictionarySelectorModal)
