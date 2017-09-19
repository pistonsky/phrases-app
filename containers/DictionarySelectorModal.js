import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  FlatList,
  TouchableHighlight,
  TouchableOpacity,
  Text,
  TextInput,
  View
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
            <Text style={{ fontSize: 17, color: colors.white }}>
              Выберите словарь
            </Text>
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
                Закрыть
              </Text>
            </TouchableOpacity>
          </View>
          <FlatList
            style={styles.flatlist}
            contentContainerStyle={{ backgroundColor: 'transparent' }}
            data={this.props.dictionaries}
            keyExtractor={item => item.name}
            renderItem={({ item }) => (
              <TouchableHighlight
                underlayColor="#888"
                activeOpacity={1}
                onPress={() =>
                  store.dispatch({ type: SELECT_DICTIONARY, name: item.name })}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: 10,
                    paddingHorizontal: 20
                  }}
                >
                  <Text style={{ color: colors.white, fontSize: 18 }}>
                    {item.name}
                  </Text>
                  {item.selected && (
                    <Icon
                      name="ios-checkmark"
                      type="ionicon"
                      size={30}
                      color={colors.white}
                    />
                  )}
                </View>
              </TouchableHighlight>
            )}
            ItemSeparatorComponent={() => (
              <Separator
                style={{
                  backgroundColor: colors.white,
                  opacity: 0.2,
                  marginHorizontal: 10,
                  width: 'auto'
                }}
              />
            )}
            ListFooterComponent={
              <TextInput
                style={{
                  backgroundColor: 'transparent',
                  fontSize: 18,
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
                placeholder="Добавить..."
                placeholderTextColor="#888"
              />
            }
          />
        </BlurView>
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
