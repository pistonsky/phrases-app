import React from 'react'
import { connect } from 'react-redux'
import { View, Button } from 'react-native'
import { DictionarySelector } from 'app/containers'
import styles from 'app/styles'
import colors from 'app/styles/colors'
import { OPEN_ADD_NEW_MODAL, PLAY_ALL } from 'app/actions/types'
import { store } from 'app/redux'
import { getData } from 'app/reducers/selectors'

const NavBar = props => {
  const { data } = props
  return (
    <View style={styles.navBarStyle}>
      <View style={{ opacity: data.length ? 1 : 0 }}>
        <Button onPress={() => store.dispatch({ type: PLAY_ALL })} title="Play All" color={colors.primary} />
      </View>
      <DictionarySelector />
      <Button onPress={() => store.dispatch({ type: OPEN_ADD_NEW_MODAL })} title="Add" color={colors.primary} />
    </View>
  )
}

function mapStateToProps(state) {
  return {
    data: getData(state),
  }
}

export default connect(mapStateToProps)(NavBar)
