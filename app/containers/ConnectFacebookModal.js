import React from 'react'
import { connect } from 'react-redux'
import { Modal, Text, View, Button, ActivityIndicator } from 'react-native'
import { SocialIcon } from 'react-native-elements'
import styles from 'app/styles'
import { connectFacebook, ignoreConnectFacebook } from 'app/actions'
import {
  getUserId,
  shouldShowConnectFacebookModal,
  facebookConnectInProgress,
} from 'app/reducers/selectors'

const ConnectFacebookModal = props => {
  const { in_progress, visible, user_id } = props
  return (
    <Modal animationType={in_progress ? 'none' : 'slide'} transparent visible={visible}>
      {in_progress ? (
        <View style={styles.modalContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 10 }}>Logging you in...</Text>
          </View>
        </View>
      ) : (
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Create an Account</Text>
          <Text style={styles.modalSubtitle}>So that you never loose your nasty phrazes!</Text>
          <SocialIcon
            button
            title="Login with Facebook"
            type="facebook"
            style={{ paddingLeft: 20, paddingRight: 20 }}
            onPress={() => {
              props.connectFacebook(user_id)
            }}
          />
          <Button
            onPress={() => {
              props.ignoreConnectFacebook()
            }}
            title="Not now"
            color="#888"
          />
        </View>
      )}
    </Modal>
  )
}

function mapStateToProps(state) {
  return {
    visible: shouldShowConnectFacebookModal(state),
    in_progress: facebookConnectInProgress(state),
    user_id: getUserId(state),
  }
}

export default connect(
  mapStateToProps,
  {
    connectFacebook,
    ignoreConnectFacebook,
  },
)(ConnectFacebookModal)
