import { call, select, take, put, delay } from 'redux-saga/effects'
import RNFS from 'react-native-fs'
import { RNS3 } from 'react-native-aws3'

import { getUserId, getOffline, anyUnsyncedPhrases, getUnsyncedPhrases } from 'app/reducers/selectors'
import {
  ADD_NEW_PHRASE,
  UPDATE_PHRASE,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES,
  ADD_SHARED_DICTIONARY,
  PHRASE_UPLOADED,
  PHRASE_SYNCED,
  ALL_PHRASES_SYNCED,
} from 'app/actions/types'
import * as config from 'app/utils/config'
import * as api from 'app/api'

const INTERVAL = 5000

const syncSaga = function* syncSaga() {
  while (true) {
    // sync all unsynced phrases
    while (yield select(anyUnsyncedPhrases)) {
      (yield call(sync)) || (yield delay(INTERVAL))
    }
    yield put({ type: ALL_PHRASES_SYNCED })
    // wait for new or updated phrases
    yield take([ADD_NEW_PHRASE, UPDATE_PHRASE, ADD_SHARED_DICTIONARY, ADD_SHARED_PHRASES, ADD_SHARED_PHRASE])
  }
}

const sync = function* sync() {
  const offline = yield select(getOffline)
  if (offline === true) {
    return false
  }
  const unsynced = yield select(getUnsyncedPhrases)
  let sync_ok = true
  for (const phrase of unsynced) {
    sync_ok = sync_ok && (yield call(syncPhrase, phrase))
  }
  return sync_ok
}

const syncPhrase = function* syncPhrase(phrase) {
  if ((yield call(uploadAudio, phrase)) && (yield call(uploadPhrase, phrase))) {
    yield put({ type: PHRASE_SYNCED, uri: phrase.uri })
    return true
  }
  return false
}

const uploadAudio = function* uploadAudio(phrase) {
  if (phrase.uploaded) {
    return true
  }
  if (phrase.recorded === false) {
    return false
  }
  const localUri = `${RNFS.DocumentDirectoryPath}/${phrase.uri}.mp4`
  const exists = yield call(RNFS.exists, localUri)
  if (exists) {
    try {
      const file = {
        uri: localUri,
        name: `${phrase.uri}.mp4`,
        type: 'audio/mp4',
      }
      const options = {
        keyPrefix: '',
        bucket: config.S3_BUCKET,
        region: config.S3_REGION,
        accessKey: config.S3_ACCESS_KEY,
        secretKey: config.S3_SECRET_KEY,
        successActionStatus: 201,
      }
      const response = yield call(RNS3.put, file, options)
      if (response.status === 201) {
        yield put({ type: PHRASE_UPLOADED, uri: phrase.uri })
        return true
      }
      return false
    } catch (e) {
      return false
    }
  } else {
    return false
  }
}

const uploadPhrase = function* uploadPhrase(phrase) {
  const user_id = yield select(getUserId)
  try {
    const result = yield call(api.addPhrase, phrase, user_id)
    if (result.status === 200) {
      return true
    } else {
      return false
    }
  } catch (e) {
    return false
  }
}

export default syncSaga
