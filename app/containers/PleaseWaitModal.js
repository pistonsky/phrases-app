import React from 'react'
import { connect } from 'react-redux'
import { Modal, View, Text, ActivityIndicator, StyleSheet, TouchableWithoutFeedback } from 'react-native'
import { BlurView } from '@react-native-community/blur'

import { CANCEL_PLAY_ALL } from 'app/actions/types'
import { shouldShowPleaseWaitModal } from 'app/reducers/selectors'
import { store } from 'app/redux'
import I18n from 'app/utils/i18n'

const PleaseWaitModal = ({ visible }) => {
  return (
    <Modal
      animationType="none"
      transparent
      visible={visible}
      onRequestClose={() => {
        store.dispatch({ type: CANCEL_PLAY_ALL })
      }}
    >
      <TouchableWithoutFeedback
        onPress={() => {
          store.dispatch({ type: CANCEL_PLAY_ALL })
        }}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => false}>
            <BlurView blurType="dark" blurAmount={100} style={styles.container}>
              <ActivityIndicator size="large" />
              <Text style={styles.text}>{`${I18n.t('Downloading')}...`}</Text>
            </BlurView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  )
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    width: 140,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 15,
  },
  text: {
    color: 'white',
  },
})

function mapStateToProps(state) {
  return {
    visible: shouldShowPleaseWaitModal(state),
  }
}

export default connect(mapStateToProps)(PleaseWaitModal)
