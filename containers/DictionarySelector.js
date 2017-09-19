import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Text, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';
import store from '../store';
import { TOGGLE_DICTIONARY_SELECTOR } from '../actions/types';
import colors from '../styles/colors';
import { getCurrentDictionaryName } from '../reducers/selectors';

class DictionarySelector extends Component {
  render() {
    return (
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center' }}
        onPress={() => store.dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })}
      >
        <Text style={{ fontSize: 18, marginRight: 5, color: colors.white }}>
          {this.props.dictionary}
        </Text>
        <Icon
          name="chevron-down"
          type="entypo"
          size={12}
          color={colors.white}
          style={{ position: 'relative', top: 2 }}
        />
      </TouchableOpacity>
    );
  }
}

function mapStateToProps(state) {
  return {
    dictionary: getCurrentDictionaryName(state)
  };
}

export default connect(mapStateToProps)(DictionarySelector);
