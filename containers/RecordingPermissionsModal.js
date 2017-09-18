import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, Text, Platform } from 'react-native';
import { Permissions, BlurView } from 'expo';
import { Button } from 'react-native-elements';
import { getRecordingPermissions, getUserId } from '../reducers/selectors';
import styles from '../styles';
import colors from '../styles/colors';
import store from '../store';
import {
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED
} from '../actions/types';

class RecordingPermissionsModal extends Component {
  async _askForPermissionsAsync() {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
  }

  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.visible}
      >
        <BlurView tint='dark' intensity={100} style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Микрофон</Text>
          <Text style={styles.modalSubtitle}>
            Он нужен для того, чтобы вы могли записывать произношение фраз.
          </Text>
          <Button
            backgroundColor={colors.secondary_dark}
            raised
            large
            buttonStyle={styles.button}
            fontWeight="bold"
            borderRadius={Platform.OS === 'ios' ? 30 : 0}
            title="Разрешить"
            onPress={() => {
              this._askForPermissionsAsync();
            }}
          />
        </BlurView>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  const visible = !getRecordingPermissions(state) && getUserId(state) !== null;
  return { visible };
}

export default connect(mapStateToProps)(RecordingPermissionsModal);
