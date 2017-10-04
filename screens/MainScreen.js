import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, StatusBar, Linking, NetInfo, AppState } from 'react-native';
import { Permissions, Constants } from 'expo';
import qs from 'qs';
import {
  AddNewModal,
  PhrasesList,
  RecordingPermissionsModal,
  ConnectFacebookModal,
  DictionarySelectorModal,
  SyncModal
} from '../containers';
import { getUserId } from '../reducers/selectors';
import store from '../store';
import {
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES,
  ADD_SHARED_DICTIONARY,
  GO_ONLINE,
  GO_OFFLINE
} from '../actions/types';
import styles from '../styles';
import colors from '../styles/colors';
import * as api from '../api';

class MainScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Phrazes`,
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
    NetInfo.addEventListener('change', reach =>
      this._connectionInfoHandler(reach)
    );
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        NetInfo.fetch().then(reach =>
          this._connectionInfoHandler(reach)
        );
      }
    });
  }

  _connectionInfoHandler(reach) {
    if (reach === 'wifi' || reach === 'cell') { // WARNING! THESE WILL CHANGE IN 0.48
      store.dispatch({ type: GO_ONLINE });
    }
    if (reach === 'none') {
      store.dispatch({ type: GO_OFFLINE });
    }
  }

  async _handleDeepLink(url) {
    let queryString = url.replace(Constants.linkingUri, '');
    if (queryString) {
      let data = qs.parse(queryString);
      if (data.user_id) {
        if (data.dictionary) {
          // it was a "share this dictionary" link
          const { data: { phrases } } = await api.getPhrases({ user_id: data.user_id, dictionary: data.dictionary });
          store.dispatch({ type: ADD_SHARED_DICTIONARY, phrases });
        } else {
          // it was a "share all phrases" link
          const { data: { phrases } } = await api.getPhrases({ user_id: data.user_id });
          store.dispatch({ type: ADD_SHARED_PHRASES, phrases });
        }
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
        <ConnectFacebookModal />
        <DictionarySelectorModal />
        <SyncModal />
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
