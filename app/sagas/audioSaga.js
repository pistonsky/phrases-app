import { takeEvery, select, call, put } from 'redux-saga/effects'
import { Alert, Platform, StatusBar } from 'react-native'
import { Player } from '@react-native-community/audio-toolkit'
import RNFS from 'react-native-fs'

import { getCachedAudioUri } from 'app/reducers/selectors'
import { PLAY_PHRASE, AUDIO_CACHED, PLAYBACK_JUST_FINISHED } from 'app/actions/types'
import * as config from 'app/utils/config'
import { store } from 'app/redux'

const audioSaga = function* audioSaga() {
  yield takeEvery(PLAY_PHRASE, playPhrase)
}

const playPhrase = function* playPhrase(action) {
  // check cache
  let localUri = yield select(getCachedAudioUri, action.phrase.uri)

  if (localUri === undefined) {
    yield call(cacheAudio, action.phrase.uri)
    localUri = yield select(getCachedAudioUri, action.phrase.uri)
  }

  try {
    const player = new Player(localUri.replace(`${RNFS.DocumentDirectoryPath}/`, ''))
    player.on('ended', () => store.dispatch({ type: PLAYBACK_JUST_FINISHED }))
    player.play()
  } catch (e) {
    Alert.alert('No Sound', 'The pronounciation for this phrase is missing.')
  }
}

function downloadFile(options) {
  const { promise } = RNFS.downloadFile(options)
  return promise
}

const cacheAudio = function* cacheAudio(uri) {
  let localUri
  let success = false
  // check if already exists in filesystem
  const fileUriMP4 = `${RNFS.DocumentDirectoryPath}/${uri}.mp4`
  const fileUriCAF = `${RNFS.DocumentDirectoryPath}/${uri}.caf`
  const existsMP4 = yield call(RNFS.exists, fileUriMP4)
  const existsCAF = yield call(RNFS.exists, fileUriCAF)
  if (existsMP4) {
    localUri = fileUriMP4
    success = true
  } else if (existsCAF) {
    localUri = fileUriCAF
    success = true
  } else {
    Platform.OS === 'ios' && StatusBar.setNetworkActivityIndicatorVisible(true)
    let remoteUri = `${config.BASE_AUDIO_URL}${uri}.mp4`
    localUri = fileUriMP4
    const downloadResult = yield call(downloadFile, { fromUrl: remoteUri, toFile: localUri })
    success = downloadResult.statusCode === 200
    if (!success) {
      remoteUri = `${config.BASE_AUDIO_URL}${uri}.caf`
      localUri = fileUriCAF
      const { statusCode } = yield call(downloadFile, { fromUrl: remoteUri, toFile: localUri })
      success = statusCode === 200
    }
    Platform.OS === 'ios' && StatusBar.setNetworkActivityIndicatorVisible(false)
  }
  if (success) {
    yield put({ type: AUDIO_CACHED, uri, localUri })
  }
}

export default audioSaga
