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

  const { tree, store } = await renderApp()

  expect(store.getState().auth.id).toBe('user-1')
  const texts = renderedTexts(tree)
  expect(texts).toEqual(expect.arrayContaining(['Play All', 'Add', 'Spanish', 'Hola', 'Hello']))
})
