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
import I18n from 'app/utils/i18n'

const ConnectFacebookModal = props => {
  const { in_progress, visible, user_id } = props
  return (
    <Modal animationType={in_progress ? 'none' : 'slide'} transparent visible={visible}>
      {in_progress ? (
        <View style={styles.modalContainer}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <ActivityIndicator size="small" />
            <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 10 }}>{`${I18n.t('Logging you in')}...`}</Text>
          </View>
        </View>
      ) : (
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{I18n.t('Create an Account')}</Text>
          <Text style={styles.modalSubtitle}>{I18n.t('So that you never loose your nasty phrazes!')}</Text>
          <SocialIcon
            button
            title={I18n.t('Login with Facebook')}
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
            title={I18n.t('Not now')}
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
