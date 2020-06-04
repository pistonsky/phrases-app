import { takeEvery, select, call, put, race, take, cancel, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import TrackPlayer from 'react-native-track-player'
import {
  PLAY_ALL,
  CANCEL_PLAY_ALL,
  OPEN_PHRASE,
  PLAY_PHRASE,
  CLOSE_PHRASE_MODAL,
  PLAYBACK_JUST_FINISHED,
  HIDE_PLEASE_WAIT_MODAL,
} from 'app/actions/types'
import { getData, getPhrase, getCachedAudioUri } from 'app/reducers/selectors'
import { cacheAudio } from 'app/sagas/audioSaga'

let playAllTask

const playAllSaga = function* playAllSaga() {
  yield takeEvery(PLAY_ALL, forkPlayAll)
  yield takeEvery(CANCEL_PLAY_ALL, abortPlayAll)
}

const createTrackChangedChannel = () => {
  return eventChannel(emit => {
    const handler = ({ track, nextTrack }) => {
      emit(track || nextTrack)
    }
    const eventListener = TrackPlayer.addEventListener('playback-track-changed', handler)
    const unsubscribe = () => {
      eventListener.remove()
    }
    return unsubscribe
  })
}

const createQueueEndedChannel = () => {
  return eventChannel(emit => {
    const handler = ({ track }) => {
      emit(track)
    }
    const eventListener = TrackPlayer.addEventListener('playback-queue-ended', handler)
    const unsubscribe = () => {
      eventListener.remove()
    }
    return unsubscribe
  })
}

const abortPlayAll = function* abortPlayAll() {
  if (playAllTask) {
    yield cancel(playAllTask)
    TrackPlayer.stop()
  }
}

const forkPlayAll = function* forkPlayAll() {
  playAllTask = yield fork(playAll)
}

const playAll = function* playAll() {
  // create a randomized playlist made of current dictionary
  let playlist = []
  let next
  let nextPhraseUri

  const nextTrack = yield call(createTrackChangedChannel)
  const queueEnd = yield call(createQueueEndedChannel);
  while (true) {
    if (playlist.length === 0) {
      const { playlist: initialPlaylist, tracks } = yield call(createRandomizedPlaylist)
      playlist = initialPlaylist
      TrackPlayer.setupPlayer().then(() => {
        TrackPlayer.updateOptions({
          capabilities: [
            TrackPlayer.CAPABILITY_PLAY,
            TrackPlayer.CAPABILITY_PAUSE,
            TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
            TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
          ]
        })
        TrackPlayer.add(tracks).then(() => {
          TrackPlayer.play()
        })
      })
      nextPhraseUri = yield take(nextTrack)
    }
    next = yield select(getPhrase, nextPhraseUri)
    if (next) {
      yield put({ type: OPEN_PHRASE, phrase: next })
    }
    const { cancel, nextTrackOutcome, queueEndedOutcome } = yield race({
      cancel: take(CLOSE_PHRASE_MODAL),
      nextTrackOutcome: take(nextTrack),
      queueEndedOutcome: take(queueEnd),
    })
    if (cancel) {
      TrackPlayer.stop()
      break
    } else {
      nextPhraseUri = nextTrackOutcome
    }
    if (queueEndedOutcome) {
      nextPhraseUri = queueEndedOutcome
      next = yield select(getPhrase, nextPhraseUri)
      if (next) {
        yield put({ type: OPEN_PHRASE, phrase: next })
      }
      playlist = []
    }
  }
}

const createRandomizedPlaylist = function* createRandomizedPlaylist() {
  const phrases = yield select(getData)
  const playlist = []
  const tracks = []
  while (phrases.length) {
    const random_index = Math.floor(Math.random() * phrases.length)
    const next = phrases.splice(random_index, 1)
    playlist.push(next[0])
    let localUri = yield select(getCachedAudioUri, next[0].uri)
    if (localUri === undefined) {
      yield call(cacheAudio, next[0].uri)
      localUri = yield select(getCachedAudioUri, next[0].uri)
    }
    tracks.push({
      id: next[0].uri,
      url: `file://${localUri}`,
      title: next[0].translated,
      artist: next[0].original,
      album: next[0].dictionary,
      genre: 'Progressive House, Electro House',
      date: '2014-05-20T07:00:00+00:00',
    })
  }
  yield put({ type: HIDE_PLEASE_WAIT_MODAL })
  return { playlist, tracks }
}

export default playAllSaga
