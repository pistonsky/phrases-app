/* eslint-env jest */
import React from 'react'

// Renders the real app (store, sagas, persistence, navigation) with the native modules mocked in jest/setup.js.
// Modules are loaded per test so every test starts with a fresh store.
async function renderApp() {
  const { act, create } = require('react-test-renderer')
  const { Provider } = require('react-redux')
  const { store } = require('app/redux')
  const AppRouter = require('../AppRouter').default

  let tree
  await act(async () => {
    tree = create(
      <Provider store={store}>
        <AppRouter />
      </Provider>,
    )
  })
  // the startup saga waits a second before leaving the loading screen
  await act(async () => {
    jest.advanceTimersByTime(1500)
  })
  return { tree, store }
}

function renderedTexts(tree) {
  const { Text } = require('react-native')
  return tree.root.findAllByType(Text).map(node => [].concat(node.props.children).join(''))
}

// presses the touchable around the given label
async function press(tree, label) {
  const { act } = require('react-test-renderer')
  const { Text } = require('react-native')
  let node = tree.root.findAllByType(Text).find(n => [].concat(n.props.children).join('') === label)
  while (!node.props.onPress) {
    node = node.parent
  }
  await act(async () => {
    await node.props.onPress()
  })
}

async function persistReturningUser() {
  const persisted = {
    auth: JSON.stringify({ id: 'user-1', facebook_connected: true, facebook_connect_in_progress: false }),
    main: JSON.stringify({
      add_new_modal_shown: false,
      recording_permissions: true,
      data: [{ uri: 'abc', original: 'Hola', translated: 'Hello', dictionary: 'Spanish', synced: true }],
      data_loading: false,
      dictionaries: [{ name: 'Spanish', selected: true }],
      guide: [],
    }),
    _persist: JSON.stringify({ version: -1, rehydrated: true }),
  }
  await require('@react-native-async-storage/async-storage').default.setItem(
    'persist:root',
    JSON.stringify(persisted),
  )
}

beforeEach(() => {
  jest.resetModules()
  jest.useFakeTimers()
})

afterEach(() => {
  jest.useRealTimers()
})

test('shows the onboarding to new users', async () => {
  const { tree } = await renderApp()

  expect(require('react-native-bootsplash').default.hide).toHaveBeenCalled()
  const texts = renderedTexts(tree)
  expect(texts).toContain('Learn languages with natives\nphrase by phrase')
  expect(texts).toContain('Login')
})

test('takes returning users to their phrases', async () => {
  await persistReturningUser()

  const { tree, store } = await renderApp()

  expect(store.getState().auth.id).toBe('user-1')
  const texts = renderedTexts(tree)
  expect(texts).toEqual(expect.arrayContaining(['Play All', 'Add', 'Spanish', 'Hola', 'Hello']))
})

test("re-records a phrase's audio", async () => {
  const { act, create } = require('react-test-renderer')
  const { Provider } = require('react-redux')
  const RNFS = require('@dr.pogodin/react-native-fs')
  const { store } = require('app/redux')
  const { DATA_LOADED, OPEN_PHRASE } = require('app/actions/types')
  const PhraseModal = require('app/containers/PhraseModal').default
  const RecButton = require('app/components/RecButton').default
  const { createSound } = require('react-native-nitro-sound')
  // the phrase's old recording is on disk
  RNFS.exists.mockImplementation(path => Promise.resolve(path === '/documents/abc.mp4'))
  const phrase = {
    uri: 'abc',
    original: 'Hola',
    translated: 'Hello',
    dictionary: 'Spanish',
    synced: true,
    uploaded: true,
  }

  // rendered on its own: inside the app, the main screen stops updating under Jest once it's mounted
  let tree
  await act(async () => {
    tree = create(
      <Provider store={store}>
        <PhraseModal />
      </Provider>,
    )
  })
  await act(async () => {
    store.dispatch({ type: DATA_LOADED, phrases: [phrase] })
    store.dispatch({ type: OPEN_PHRASE, phrase })
  })
  await press(tree, 'Reset')

  // hold the record button for a second
  const recButton = tree.root.findByType(RecButton)
  const sound = createSound.mock.results[createSound.mock.results.length - 1].value
  const [button] = recButton.findAll(node => typeof node.props.onTouchStart === 'function')
  await act(async () => {
    button.props.onTouchStart()
  })
  await act(async () => {
    jest.advanceTimersByTime(1000)
  })
  await act(async () => {
    button.props.onTouchEnd()
  })
  expect(sound.startRecorder).toHaveBeenCalledWith('/documents/rerecording.mp4')
  expect(sound.stopRecorder).toHaveBeenCalled()

  await press(tree, 'Done')

  // the new recording replaces the old one, is played from now on and gets uploaded again
  expect(RNFS.unlink).toHaveBeenCalledWith('/documents/abc.mp4')
  expect(RNFS.moveFile).toHaveBeenCalledWith('/documents/rerecording.mp4', '/documents/abc.mp4')
  expect(store.getState().audio.cache.abc).toBe('/documents/abc.mp4')
  expect(store.getState().main.data[0]).toMatchObject({ recorded: true, uploaded: false, synced: false })
})
