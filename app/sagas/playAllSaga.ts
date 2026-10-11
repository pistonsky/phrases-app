import { takeEvery, select, call, put, race, take, cancel, fork } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import TrackPlayer, { Capability, Event } from 'react-native-track-player'
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

let playerSetup

// setupPlayer() may only be called once per app run, so share a single promise
const setupPlayer = () => {
  if (!playerSetup) {
    playerSetup = TrackPlayer.setupPlayer()
      .catch(e => {
        if (e.code !== 'player_already_initialized') {
          playerSetup = undefined
          throw e
        }
      })
      .then(() => TrackPlayer.updateOptions({
        capabilities: [Capability.Play, Capability.Pause, Capability.SkipToNext, Capability.SkipToPrevious],
      }))
  }
  return playerSetup
}

const createTrackChangedChannel = () => {
  return eventChannel(emit => {
    const handler = ({ track }: { track?: { id?: string } }) => {
      // `track` is the newly active track; it's undefined when the queue gets cleared
      if (track) {
        emit(track.id)
      }
    }
    const eventListener = TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, handler as any)
    const unsubscribe = () => {
      eventListener.remove()
    }
    return unsubscribe
  })
}

const createQueueEndedChannel = () => {
  return eventChannel(emit => {
    const handler = () => {
      emit(true)
    }
    const eventListener = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, handler)
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
      setupPlayer()
        .then(() => TrackPlayer.reset()) // start the new random playlist from scratch
        .then(() => TrackPlayer.add(tracks))
        .then(() => TrackPlayer.play())
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
      // the last phrase stays open while a new random playlist is prepared
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
