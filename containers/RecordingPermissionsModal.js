import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Modal, View, Text } from 'react-native';
import { Permissions } from 'expo';
import { Button } from 'react-native-elements';
import { getRecordingPermissions } from '../reducers/selectors';
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
        transparent={false}
        visible={this.props.visible}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.modalTitle}>Доступ к микрофону</Text>
          <Text style={styles.modalSubtitle}>
            Он нужен для того, чтобы вы могли записывать произношение фраз.
          </Text>
          <Button
            backgroundColor={colors.secondary}
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
        </View>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: !getRecordingPermissions(state)
  };
}

export default connect(mapStateToProps)(RecordingPermissionsModal);
