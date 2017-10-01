import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Modal,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform
} from 'react-native';
import { Icon } from 'react-native-elements';
import { BlurView } from 'expo';
import store from '../store';
import { shouldShowSyncModal } from '../reducers/selectors';
import { CANCEL_SHARE } from '../actions/types';
import colors from '../styles/colors';

class SyncModal extends Component {
  render() {
    const Container = Platform.OS === 'ios' ? BlurView : View;
    return (
      <Modal
        animationType="none"
        transparent={true}
        visible={this.props.sync_modal_shown}
        onRequestClose={() => {
          store.dispatch({ type: CANCEL_SHARE });
        }}
      >
        <Container
          intensity={100}
          tint="dark"
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#000000'
          }}
        >
          <ActivityIndicator
            size="large"
            color={colors.white}
            style={{ margin: 20 }}
          />
          <Text style={{ fontSize: 12, color: colors.white }}>
            Syncing phrazes, please wait...
          </Text>
        </Container>
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            height: 100,
            left: 0,
            right: 0,
            justifyContent: 'center'
          }}
        >
          <TouchableOpacity
            onPress={() => {
              store.dispatch({ type: CANCEL_SHARE });
            }}
          >
            <View
              style={{
                opacity: 0.5,
                flexDirection: 'column',
                alignItems: 'center',
                marginBottom: 10
              }}
            >
              <Icon
                name="ios-close-circle"
                type="ionicon"
                size={30}
                color={colors.white}
              />
              <Text style={{ color: colors.white, fontSize: 12 }}>Cancel</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    );
  }
}

function mapStateToProps(state) {
  return {
    sync_modal_shown: shouldShowSyncModal(state)
  };
}

export default connect(mapStateToProps)(SyncModal);
