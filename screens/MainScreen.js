import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StatusBar, Linking } from 'react-native';
import { Permissions, Constants } from 'expo';
import qs from 'qs';
import {
  AddNewModal,
  PhrasesList,
  RecordingPermissionsModal,
  ConnectFacebookModal
} from '../containers';
import { getUserId } from '../reducers/selectors';
import store from '../store';
import {
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES
} from '../actions/types';
import styles from '../styles';
import colors from '../styles/colors';
import * as api from '../api';

class MainScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Phrases`,
    headerStyle: styles.navBarStyle,
    headerTintColor: colors.white,
    back: false
  });

  componentDidMount() {
    Linking.getInitialURL().then(url => {
      this._handleDeepLink(url);
    });
    Linking.addEventListener('url', ({ url }) => {
      this._handleDeepLink(url);
    });
  }

  async _handleDeepLink(url) {
    let queryString = url.replace(Constants.linkingUri, '');
    if (queryString) {
      let data = qs.parse(queryString);
      if (data.user_id) {
        // it was a "share all phrases" link
        const { data: phrases } = await api.getPhrases(data.user_id);
        store.dispatch({ type: ADD_SHARED_PHRASES, phrases });
      }
      if (data.uri) {
        const phrase = {
          original: data.original,
          translated: data.translated,
          uri: data.uri
        };
        store.dispatch({
          type: ADD_SHARED_PHRASE,
          ...phrase
        });
        api.addPhrase(phrase, this.props.user_id);
      }
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <AddNewModal />
        <RecordingPermissionsModal />
        <ConnectFacebookModal />
        <StatusBar barStyle="dark-content" translucent={true} />
        <PhrasesList />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: getUserId(state)
  };
}

export default connect(mapStateToProps)(MainScreen);
