import { take, race, select, put, call, cancelled } from 'redux-saga/effects';
import { Alert, Linking, Platform, Share } from 'react-native';
import qs from 'qs';
import {
  getUserId,
  getOffline,
  anyUnsyncedPhrases
} from '../reducers/selectors';
import {
  CANCEL_SHARE,
  SHARE_PHRASE,
  SHARE_PHRASE_COMPLETED,
  SHARE_ALL_PHRASES,
  SHARE_ALL_PHRASES_COMPLETED,
  SHOW_SYNC_MODAL,
  HIDE_SYNC_MODAL,
  PHRASE_SYNCED,
  ALL_PHRASES_SYNCED
} from '../actions/types';
import * as config from '../utils/config';
import store from '../store';

const shareSaga = function* shareSaga() {
  while (true) {
    const { shareSingle, shareAll } = yield race({
      shareSingle: take(SHARE_PHRASE),
      shareAll: take(SHARE_ALL_PHRASES)
    });
    if (yield select(getOffline)) {
      Alert.alert(
        'Offline Mode',
        "You're offline. Please connect to wi-fi or turn on cellular data to share.",
        [
          {
            text: 'Settings',
            onPress: () => Linking.openURL('App-prefs:root')
          },
          { text: 'OK', onPress: () => {} }
        ]
      );
    } else {
      if (shareSingle) {
        const { phrase } = shareSingle;
        if (phrase.synced === false) {
          yield race({
            cancel: take(CANCEL_SHARE),
            share: call(waitUntilSyncedThenShare, phrase)
          });
        } else {
          yield call(sharePhrase, phrase);
        }
      }
      if (shareAll) {
        if (yield select(anyUnsyncedPhrases)) {
          yield race({
            cancel: take(CANCEL_SHARE),
            share: call(waitUntilSyncedThenShareAll)
          });
        } else {
          const user_id = yield select(getUserId);
          yield call(shareAllPhrases, user_id);
        }
      }
    }
  }
};

const waitUntilSyncedThenShareAll = function* waitUntilSyncedThenShareAll() {
  try {
    yield put({ type: SHOW_SYNC_MODAL });
    yield take(ALL_PHRASES_SYNCED);
    const user_id = yield select(getUserId);
    requestAnimationFrame(() => {
      store.dispatch({ type: HIDE_SYNC_MODAL });
      requestAnimationFrame(() => {
        shareAllPhrases(user_id);
      });
    });
  } finally {
    if (yield cancelled()) {
      yield put({ type: HIDE_SYNC_MODAL });
    }
  }
  return true;
};

const waitUntilSyncedThenShare = function* waitUntilSyncedThenShare(phrase) {
  try {
    yield put({ type: SHOW_SYNC_MODAL });
    while (true) {
      const { single, all } = yield race({
        single: take(PHRASE_SYNCED),
        all: take(ALL_PHRASES_SYNCED)
      });
      if (all) break;
      if (single) {
        if (phrase.uri === single.uri) break;
      }
    }
    requestAnimationFrame(() => {
      store.dispatch({ type: HIDE_SYNC_MODAL });
      requestAnimationFrame(() => {
        sharePhrase(phrase);
      });
    });
  } finally {
    if (yield cancelled()) {
      yield put({ type: HIDE_SYNC_MODAL });
    }
  }
  return true;
};

const sharePhrase = function sharePhrase(phrase) {
  const url =
    config.BASE_URL +
    '/share?' +
    qs.stringify({
      original: phrase.original,
      translated: phrase.translated,
      uri: phrase.uri
    });
  let message = `Check out my phraze! "${phrase.original}" => "${phrase.translated}"`;
  if (Platform.OS !== 'ios') {
    message += ` ${url}`;
  }
  Share.share(
    { message, title: 'Phrazes', url },
    { dialogTitle: 'Share a phraze' }
  ).then(e => store.dispatch({ type: SHARE_PHRASE_COMPLETED }));
  return true;
};

const shareAllPhrases = function shareAllPhrases(user_id) {
  const url =
    config.BASE_URL +
    '/share?' +
    qs.stringify({
      user_id
    });
  let message = 'Check out my phrazes!';
  if (Platform.OS !== 'ios') {
    message += ` ${url}`;
  }
  Share.share(
    { message, title: 'Phrazes', url },
    { dialogTitle: 'Share all your phrazes' }
  ).then(e => store.dispatch({ type: SHARE_ALL_PHRASES_COMPLETED }));
  return true;
};

export default shareSaga;
