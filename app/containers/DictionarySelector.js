import React from 'react'
import { connect } from 'react-redux'
import { Text, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'
import { store } from 'app/redux'
import { TOGGLE_DICTIONARY_SELECTOR } from 'app/actions/types'
import colors from 'app/styles/colors'
import { getCurrentDictionaryName } from 'app/reducers/selectors'
import { smartFontSize } from 'app/utils/functions'

const DictionarySelector = props => {
  const { dictionary } = props
  return (
    <TouchableOpacity
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
      }}
      onPress={() => store.dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })}
    >
      <Text
        style={{
          fontSize: smartFontSize({
            min: 14,
            max: 18,
            threshold: 18,
            text: dictionary,
          }),
          marginRight: 5,
          color: colors.white,
          textAlign: 'center',
        }}
        numberOfLines={2}
      >
        {dictionary}
      </Text>
      <Icon
        name="chevron-down"
        type="entypo"
        size={12}
        color={colors.white}
        style={{
          position: 'relative',
          top: smartFontSize({
            min: 1,
            max: 2,
            threshold: 18,
            text: dictionary,
          }),
        }}
      />
    </TouchableOpacity>
  )
}

function mapStateToProps(state) {
  return {
    dictionary: getCurrentDictionaryName(state),
  }
}

export default connect(mapStateToProps)(DictionarySelector)
