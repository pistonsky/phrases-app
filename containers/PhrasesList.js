import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  FlatList,
  Platform,
  StatusBar,
  Share,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Button } from 'react-native-elements';
import { Audio, FileSystem } from 'expo';
import qs from 'qs';
import { RNS3 } from 'react-native-aws3';
import { ListItem, Separator, OfflineBar } from '../components';
import {
  getData,
  getUserId,
  getDataLoading,
  getOffline
} from '../reducers/selectors';
import styles from '../styles';
import * as config from '../utils/config';
import store from '../store';
import colors from '../styles/colors';
import {
  OPEN_ADD_NEW_MODAL,
  DELETE_PHRASE,
  SHARE_PHRASE,
  SHARE_ALL_PHRASES,
  PHRASE_UPLOADED
} from '../actions/types';
import * as actions from '../actions';

class PhrasesList extends Component {
  constructor(props) {
    super(props);
    this.cache = {}; // audio cache
    this.state = {
      loaded: {} // loaded audios
    };
  }

  componentDidMount() {
    this._cacheAll(this.props.data);
  }

  componentWillReceiveProps(newProps) {
    this._cacheAll(newProps.data);
    this._uploadAll(newProps.data);
  }

  async _cacheAll(data) {
    for (let item of data) {
      if (!(item.uri in this.cache)) {
        await this._cacheAudio(item.uri);
      }
    }
  }

  async _uploadAll(data) {
    for (let item of data) {
      if (item.uploaded === false) {
        if (
          await this._uploadRecordingAsync(
            FileSystem.documentDirectory + item.uri + '.caf',
            item.uri
          )
        ) {
          store.dispatch({ type: PHRASE_UPLOADED, uri: item.uri });
        }
      }
    }
  }

  async _cacheAudio(uri) {
    let localUri;
    // check if already exists
    const fileUri = FileSystem.documentDirectory + uri + '.caf';
    const { exists } = await FileSystem.getInfoAsync(fileUri);
    if (exists) {
      localUri = fileUri;
    } else {
      const remote_uri = config.BASE_AUDIO_URL + uri + '.caf';
      Platform.OS === 'ios' &&
        StatusBar.setNetworkActivityIndicatorVisible(true);
      const result = await FileSystem.downloadAsync(remote_uri, fileUri);
      Platform.OS === 'ios' &&
        StatusBar.setNetworkActivityIndicatorVisible(false);
      localUri = result.uri;
    }
    this.cache[uri] = localUri;
    this.setState({ loaded: { ...this.state.loaded, [uri]: localUri } });
  }

  async _uploadRecordingAsync(localUri, remoteUri) {
    try {
      const file = {
        uri: localUri,
        name: remoteUri + '.caf',
        type: 'audio/x-caf'
      };
      const options = {
        keyPrefix: '',
        bucket: config.S3_BUCKET,
        region: config.S3_REGION,
        accessKey: config.S3_ACCESS_KEY,
        secretKey: config.S3_SECRET_KEY,
        successActionStatus: 201
      };
      const response = await RNS3.put(file, options);
      if (response.status !== 201) {
        return false;
      } else {
        return true;
      }
      // .progress(e => this.setState({ uploadProgress: e.loaded / e.total }))
      // .then(response => {
      //   if (response.status !== 201) {
      //     this.setState({ isUploading: false, uploaded: false });
      //   } else {
      //     this.setState({ isUploading: false, uploaded: true });
      //   }
      // });
    } catch (e) {
      // Alert.alert("Looks like we're offline =(", "We could not upload this phrase to the cloud. It is still available on your device though!");
      return false;
    }
  }

  render() {
    return (
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
            uploaded={item.uploaded === undefined ? true : item.uploaded}
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
            onDelete={item => this.props.deletePhrase(item)}
            onShare={async item => {
              const url =
                config.BASE_URL +
                '/share?' +
                qs.stringify({
                  original: item.original,
                  translated: item.translated,
                  uri: item.uri
                });
              let message = `Check out my phraze! "${item.original}" => "${item.translated}"`;
              if (Platform.OS !== 'ios') {
                message += ` ${url}`;
              }
              await Share.share(
                {
                  message,
                  title: 'Phrazes',
                  url
                },
                {
                  dialogTitle: 'Share a phraze'
                }
              );
              store.dispatch({ type: SHARE_PHRASE });
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
            {this.props.data_loading && (
              <ActivityIndicator size="small" color="#ffffff" />
            )}
            <Text style={styles.flatlistPlaceholder}>
              {this.props.data_loading
                ? 'Loading...'
                : 'Add your first phrazee!'}
            </Text>
          </View>
        }
        ListFooterComponent={
          <View style={styles.shareButtonContainer}>
            <Button
              iconRight
              icon={{ name: 'share-apple', type: 'evilicon', size: 25 }}
              title="SHARE ALL PHRAZES"
              backgroundColor={colors.secondary}
              onPress={async () => {
                const url =
                  config.BASE_URL +
                  '/share?' +
                  qs.stringify({
                    user_id: this.props.user_id
                  });
                let message = 'Check out my phrazes!';
                if (Platform.OS !== 'ios') {
                  message += ` ${url}`;
                }
                await Share.share(
                  {
                    message,
                    title: 'Phrazes',
                    url
                  },
                  {
                    dialogTitle: 'Share all your phrazes'
                  }
                );
                store.dispatch({ type: SHARE_ALL_PHRASES });
              }}
            />
            {this.props.offline && <OfflineBar />}
          </View>
        }
        refreshing={this.props.data_loading}
        onRefresh={() => this.props.refreshPhrases(this.props.user_id)}
      />
    );
  }
}

function mapStateToProps(state) {
  return {
    data: getData(state),
    data_loading: getDataLoading(state),
    user_id: getUserId(state),
    offline: getOffline(state)
  };
}

export default connect(mapStateToProps, actions)(PhrasesList);
