import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Alert,
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  Modal,
  FlatList,
  Share,
  Linking,
  Platform
} from 'react-native';
import { Button } from 'react-native-elements';
import { Permissions, Audio, Asset, FileSystem, Constants } from 'expo';
import qs from 'qs';
import { ListItem, Separator, Item, AddNewForm } from '../components';
import { getData, getAddNewModalShown, getUserId } from '../reducers/selectors';
import store from '../store';
import {
  OPEN_ADD_NEW_MODAL,
  CLOSE_ADD_NEW_MODAL,
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  DELETE_PHRASE,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES
} from '../actions/types';
import * as config from '../utils/config';
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

  constructor(props) {
    super(props);
    this.state = {
      loaded: {} // loaded audios
    };
  }

  cache = {};

  componentDidMount() {
    this._askForPermissions();
    Linking.getInitialURL().then(url => {
      this._handleDeepLink(url);
    });
    Linking.addEventListener('url', ({ url }) => {
      this._handleDeepLink(url);
    });
  }

  async componentWillReceiveProps(newProps) {
    for (let item of newProps.data) {
      if (!(item.uri in this.cache)) {
        await this._cacheAudio(item.uri);
      }
    }
  }

  async _cacheAudio(uri) {
    let localUri;
    // check if already exists
    const fileUri = FileSystem.documentDirectory + uri + '.caf';
    const { exists } = FileSystem.getInfoAsync(fileUri);
    if (exists) {
      localUri = fileUri;
    } else {
      const remote_uri = config.BASE_AUDIO_URL + uri + '.caf';
      Platform.OS === 'ios' && StatusBar.setNetworkActivityIndicatorVisible(true);
      const result = await FileSystem.downloadAsync(remote_uri, fileUri);
      Platform.OS === 'ios' && StatusBar.setNetworkActivityIndicatorVisible(false);
      localUri = result.uri;
    }
    this.cache[uri] = localUri;
    this.setState({ loaded: { ...this.state.loaded, [uri]: localUri } });
  }

  async _handleDeepLink(url) {
    let queryString = url.replace(Constants.linkingUri, '');
    if (queryString) {
      let data = qs.parse(queryString);
      if (data.user_id) {
        // it was a "share all phrases" link
        const phrases = await api.getPhrases(data.user_id);
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
        const user_id = getUserId(store.getState());
        api.addPhrase(phrase, user_id);
      }
    }
  }

  _askForPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.props.add_new_modal_shown}
          onRequestClose={() => {
            store.dispatch({ type: CLOSE_ADD_NEW_MODAL });
          }}
        >
          <AddNewForm />
        </Modal>
        <StatusBar barStyle="dark-content" translucent={true} />
        <FlatList
          style={styles.flatlist}
          contentContainerStyle={styles.flatlistContent}
          data={this.props.data}
          keyExtractor={item => {
            return item.uri ? item.uri : item.original;
          }}
          renderItem={({ item }) => (
            <ListItem
              key={item.uri + item.original}
              item={item}
              loaded={item.uri in this.state.loaded}
              onPress={async item => {
                let localUri;
                // check cache
                if (!(this.cache && item.uri in this.cache)) {
                  await this._cacheAudio(item.uri);
                }

                localUri = this.cache[item.uri];

                try {
                  const { soundObject, status } = await Audio.Sound.create(
                    { uri: localUri },
                    { shouldPlay: true }
                  );
                } catch (e) {
                  Alert.alert(
                    'No Sound',
                    'The pronounciation for this phrase is missing.'
                  );
                }
              }}
              onDelete={item =>
                store.dispatch({ type: DELETE_PHRASE, payload: item })}
              onShare={item => {
                const url =
                  config.BASE_URL +
                  '/share?' +
                  qs.stringify({
                    original: item.original,
                    translated: item.translated,
                    uri: item.uri
                  });
                let message = `Зацени фразу! "${item.original}" => "${item.translated}"`;
                if (Platform.OS !== 'ios') {
                  message += ` ${url}`;
                }
                Share.share({
                  message,
                  title: 'Фразочки',
                  url
                },{
                  dialogTitle: 'Поделиться фразой'
                });
              }}
            />
          )}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <View
              style={styles.flatlistEmpty}
              onTouchStart={() => {
                store.dispatch({ type: OPEN_ADD_NEW_MODAL });
              }}
            >
              <Text style={styles.flatlistPlaceholder}>
                Add your first phrase!
              </Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.shareButtonContainer}>
              <Button
                iconRight
                icon={{ name: 'share-apple', type: 'evilicon', size: 25 }}
                title='SHARE ALL PHRASES'
                backgroundColor={colors.secondary}
                onPress={() => {
                  const url =
                    config.BASE_URL +
                    '/share?' +
                    qs.stringify({
                      user_id: this.props.user_id
                    });
                  let message = "Зацени мои фразочки!";
                  if (Platform.OS !== 'ios') {
                    message += ` ${url}`;
                  }
                  Share.share({
                    message,
                    title: 'Фразочки',
                    url
                  },{
                    dialogTitle: 'Поделиться всеми фразочками'
                  });
                }}
              />
            </View>
          }
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    user_id: getUserId(state),
    data: getData(state),
    add_new_modal_shown: getAddNewModalShown(state)
  };
}

export default connect(mapStateToProps)(MainScreen);
