import React, { useContext, useRef, useState } from 'react'
import { connect } from 'react-redux'
import { Modal, FlatList, TouchableOpacity, Text, TextInput, View, KeyboardAvoidingView, Platform } from 'react-native'
import { BlurView } from '@sbaiahmed1/react-native-blur'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { DictionaryListItem } from 'app/components'
import { getDictionaries, shouldShowDictionariesSelectorModal, getUserId } from 'app/reducers/selectors'
import styles from 'app/styles'
import colors from 'app/styles/colors'
import { store } from 'app/redux'
import { ADD_DICTIONARY, SELECT_DICTIONARY, TOGGLE_DICTIONARY_SELECTOR } from 'app/actions/types'
import { smartFontSize } from 'app/utils/functions'
import * as actions from 'app/actions'
import I18n from 'app/utils/i18n'
import screenInsets from 'app/utils/insets'

const DictionarySelectorModal = ({ visible, dictionaries, deleteDictionary, copyDictionaryAsTemplate, updateDictionaryName }) => {
  const [text, setText] = useState('')
  const flatlist = useRef<any>(null)
  const { top, bottom } = screenInsets(useContext(SafeAreaInsetsContext))
  // the sheet starts 20pt down, so the header only has to make up for a taller status bar
  const headerPadding = top - 20
  return (
    <Modal animationType="slide" transparent visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        // onKeyboardChange is already used here; it is not part of the RN prop types
        // @ts-expect-error existing callback kept as-is
        onKeyboardChange={() => {
          flatlist.current.scrollToEnd()
        }}
      >
        <BlurView blurType="dark" blurAmount={100} style={[styles.modalContainer, { padding: 0, marginTop: 20 }]}>
          <View
            style={{
              backgroundColor: colors.secondary,
              height: headerPadding + 40,
              paddingTop: headerPadding,
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 17, color: colors.white }}>{I18n.t('Choose')}</Text>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: headerPadding,
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
                {I18n.t('Close')}
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            ref={flatlist}
            style={styles.flatlist}
            contentContainerStyle={[styles.flatListContentContainer, { paddingBottom: bottom }]}
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
                  setTimeout(() => flatlist.current.scrollToIndex({ index, viewPosition: 1 }), 100)
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
                onChangeText={newText => setText(newText)}
                onSubmitEditing={() => {
                  store.dispatch({
                    type: ADD_DICTIONARY,
                    name: text,
                  })
                  setText('')
                }}
                onFocus={() => {
                  setTimeout(() => flatlist.current.scrollToEnd(), 100)
                }}
                placeholder={`${I18n.t('Add new dictionary')}...`}
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
