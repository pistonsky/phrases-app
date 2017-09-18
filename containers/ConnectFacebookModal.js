import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  Text,
  View,
  Platform,
  Button,
  ActivityIndicator
} from 'react-native';
import { Permissions, BlurView } from 'expo';
import { SocialIcon } from 'react-native-elements';
import styles from '../styles';
import colors from '../styles/colors';
import { connectFacebook, ignoreConnectFacebook } from '../actions';
import {
  getUserId,
  getFacebookConnected,
  shouldShowConnectFacebookModal,
  facebookConnectInProgress
} from '../reducers/selectors';

class ConnectFacebookModal extends Component {
  render() {
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={this.props.visible}
      >
        {this.props.in_progress ? (
          <BlurView tint="dark" intensity={100} style={styles.modalContainer}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ActivityIndicator size="small" />
              <Text style={{ color: '#aaa', fontSize: 12, marginLeft: 10 }}>Выполняем вход...</Text>
            </View>
          </BlurView>
        ) : (
          <BlurView tint="dark" intensity={100} style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Создайте аккаунт</Text>
            <Text style={styles.modalSubtitle}>
              Чтобы не потерять свои фразочки!
            </Text>
            <SocialIcon
              button
              title="Войти через Facebook"
              type="facebook"
              style={{ paddingLeft: 20, paddingRight: 20 }}
              onPress={() => {
                this.props.connectFacebook(this.props.user_id);
              }}
            />
            <Button
              onPress={() => {
                this.props.ignoreConnectFacebook();
              }}
              title="Я не хочу"
              color="#888"
            />
          </BlurView>
        )}
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    visible: shouldShowConnectFacebookModal(state),
    in_progress: facebookConnectInProgress(state),
    user_id: getUserId(state)
  };
}

export default connect(mapStateToProps, {
  connectFacebook,
  ignoreConnectFacebook
})(ConnectFacebookModal);
