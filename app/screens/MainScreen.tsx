import React, { Component } from 'react'
import { connect } from 'react-redux'
import { View, StatusBar } from 'react-native'
import { AddNewModal, DictionarySelectorModal, PhrasesList, PhraseModal, PleaseWaitModal } from 'app/containers'
import { getUserId } from 'app/reducers/selectors'
import styles from 'app/styles'

class MainScreen extends Component<any, any> {
  [key: string]: any
  componentDidMount() {
    // TODO: handle deeplinks (when somebody shares app)
    // TODO: handle online/offline status
    // AppState.addEventListener('change', nextAppState => {
    //   if (nextAppState === 'active') {
    //     NetInfo.fetch().then(reach => this._connectionInfoHandler(reach))
    //   }
    // })
  }

  render() {
    return (
      <View style={styles.container}>
        <AddNewModal />
        <DictionarySelectorModal />
        <PhraseModal />
        <StatusBar {...({ barStyle: 'dark-content', translucent: true } as any)} />
        <PhrasesList />
        <PleaseWaitModal />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    user_id: getUserId(state),
  }
}

export default connect(mapStateToProps)(MainScreen)
