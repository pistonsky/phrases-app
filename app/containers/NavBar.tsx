import React from 'react'
import { connect } from 'react-redux'
import { View, Button } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { DictionarySelector } from 'app/containers'
import styles from 'app/styles'
import colors from 'app/styles/colors'
import { OPEN_ADD_NEW_MODAL, PLAY_ALL } from 'app/actions/types'
import { store } from 'app/redux'
import { getData } from 'app/reducers/selectors'
import I18n from 'app/utils/i18n'
import screenInsets from 'app/utils/insets'

const NavBar = props => {
  const { data } = props
  const { top } = screenInsets(useSafeAreaInsets())
  return (
    <View style={[styles.navBarStyle, { paddingTop: top, height: top + 40 }]}>
      <View style={{ opacity: data.length ? 1 : 0 }}>
        <Button onPress={() => store.dispatch({ type: PLAY_ALL })} title={I18n.t('Play All')} color={colors.primary} />
      </View>
      <DictionarySelector />
      <Button onPress={() => store.dispatch({ type: OPEN_ADD_NEW_MODAL })} title={I18n.t('Add')} color={colors.primary} />
    </View>
  )
}

function mapStateToProps(state) {
  return {
    data: getData(state),
  }
}

export default connect(mapStateToProps)(NavBar)
