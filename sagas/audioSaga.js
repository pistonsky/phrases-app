import { takeEvery, select, call, put } from 'redux-saga/effects';
import { Alert, Platform, StatusBar } from 'react-native';
import { Audio, FileSystem } from 'expo';

import { getCachedAudioUri } from '../reducers/selectors';
import { PLAY_PHRASE, AUDIO_CACHED } from '../actions/types';
import * as config from '../utils/config';

const audioSaga = function* audioSaga() {
  yield takeEvery(PLAY_PHRASE, playPhrase);
};

const playPhrase = function* playPhrase(action) {
  // check cache
  let localUri = yield select(getCachedAudioUri, action.phrase.uri);

  if (localUri === undefined) {
    console.log(`no cache for ${action.phrase.uri}`);
    yield call(cacheAudio, action.phrase.uri);
    localUri = yield select(getCachedAudioUri, action.phrase.uri);
  }

  try {
    Audio.Sound.create(
      { uri: localUri },
      { shouldPlay: true }
    );
  } catch (e) {
    Alert.alert('No Sound', 'The pronounciation for this phrase is missing.');
  }
};

const cacheAudio = function* cacheAudio(uri) {
  let localUri;
  // check if already exists in filesystem
  const fileUri = FileSystem.documentDirectory + uri + '.caf';
  const { exists } = yield call(FileSystem.getInfoAsync, fileUri);
  if (exists) {
    localUri = fileUri;
  } else {
    const remote_uri = config.BASE_AUDIO_URL + uri + '.caf';
    Platform.OS === 'ios' && StatusBar.setNetworkActivityIndicatorVisible(true);
    let result;
    while (true) {
      try {
        result = yield call(FileSystem.downloadAsync, remote_uri, fileUri);
        break;
      } catch (e) {
        console.log(`download of ${uri} failed`);
      }
    }
    Platform.OS === 'ios' &&
      StatusBar.setNetworkActivityIndicatorVisible(false);
    localUri = result.uri;
  }
  yield put({ type: AUDIO_CACHED, uri, localUri });
};

export default audioSaga;
