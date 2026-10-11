import { takeEvery, select, call, put } from 'redux-saga/effects'
import { Alert } from 'react-native'
import { createSound } from 'react-native-nitro-sound'
import * as RNFS from '@dr.pogodin/react-native-fs'

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
    if (localUri === undefined) {
      throw new Error(`No cached audio for ${action.phrase.uri}`)
    }
    const player = getPlayer()
    player.addPlaybackEndListener(() => {
      player.removePlaybackEndListener()
      store.dispatch({ type: PLAYBACK_JUST_FINISHED })
    })
    yield call(player.startPlayer, localUri)
  } catch (e) {
    Alert.alert('No Sound', 'The pronounciation for this phrase is missing.')
  }
}

let phrasePlayer
function getPlayer() {
  if (!phrasePlayer) {
    phrasePlayer = createSound()
  }
  return phrasePlayer
}

function downloadFile(options) {
  const { promise } = RNFS.downloadFile(options)
  return promise
}

export const cacheAudio = function* cacheAudio(uri) {
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
  }
  if (success) {
    yield put({ type: AUDIO_CACHED, uri, localUri })
  }
}

export default audioSaga
