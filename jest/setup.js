/* eslint-env jest */
// Native modules aren't available under Jest, so stub the ones the app touches.

jest.mock('@react-native-async-storage/async-storage', () => {
  const items = {}
  return {
    __esModule: true,
    default: {
      getItem: jest.fn(key => Promise.resolve(key in items ? items[key] : null)),
      setItem: jest.fn((key, value) => {
        items[key] = value
        return Promise.resolve()
      }),
      removeItem: jest.fn(key => {
        delete items[key]
        return Promise.resolve()
      }),
    },
  }
})

jest.mock('react-native-bootsplash', () => ({
  __esModule: true,
  default: { hide: jest.fn(() => Promise.resolve()), isVisible: jest.fn(() => false) },
}))

jest.mock('react-native-track-player', () => ({
  __esModule: true,
  default: {
    setupPlayer: jest.fn(() => Promise.resolve()),
    updateOptions: jest.fn(() => Promise.resolve()),
    reset: jest.fn(() => Promise.resolve()),
    add: jest.fn(() => Promise.resolve()),
    play: jest.fn(() => Promise.resolve()),
    pause: jest.fn(() => Promise.resolve()),
    stop: jest.fn(() => Promise.resolve()),
    skipToNext: jest.fn(() => Promise.resolve()),
    skipToPrevious: jest.fn(() => Promise.resolve()),
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    registerPlaybackService: jest.fn(),
  },
  Capability: { Play: 0, Pause: 3, SkipToNext: 7, SkipToPrevious: 8 },
  Event: {
    PlaybackActiveTrackChanged: 'playback-active-track-changed',
    PlaybackQueueEnded: 'playback-queue-ended',
    RemotePlay: 'remote-play',
    RemotePause: 'remote-pause',
    RemoteStop: 'remote-stop',
    RemoteNext: 'remote-next',
    RemotePrevious: 'remote-previous',
  },
}))

jest.mock('react-native-nitro-sound', () => ({
  createSound: jest.fn(() => ({
    startRecorder: jest.fn(() => Promise.resolve('')),
    stopRecorder: jest.fn(() => Promise.resolve('')),
    startPlayer: jest.fn(() => Promise.resolve('')),
    stopPlayer: jest.fn(() => Promise.resolve('')),
    addPlayBackListener: jest.fn(),
    removePlayBackListener: jest.fn(),
    addPlaybackEndListener: jest.fn(),
    removePlaybackEndListener: jest.fn(),
  })),
}))

jest.mock('@dr.pogodin/react-native-fs', () => ({
  DocumentDirectoryPath: '/documents',
  exists: jest.fn(() => Promise.resolve(false)),
  moveFile: jest.fn(() => Promise.resolve()),
  downloadFile: jest.fn(() => ({ jobId: 1, promise: Promise.resolve({ statusCode: 200 }) })),
}))

jest.mock('react-native-fbsdk-next', () => ({
  LoginManager: { logInWithPermissions: jest.fn(() => Promise.resolve({ isCancelled: true })) },
  AccessToken: { getCurrentAccessToken: jest.fn(() => Promise.resolve(null)) },
}))

jest.mock('react-native-localize', () => ({
  getLocales: () => [{ languageTag: 'en-US', languageCode: 'en', countryCode: 'US', isRTL: false }],
}))

jest.mock('react-native-permissions', () => ({
  check: jest.fn(() => Promise.resolve('granted')),
  request: jest.fn(() => Promise.resolve('granted')),
  PERMISSIONS: { IOS: { MICROPHONE: 'ios.permission.MICROPHONE' } },
  RESULTS: { GRANTED: 'granted', DENIED: 'denied', BLOCKED: 'blocked' },
}))

jest.mock('@sbaiahmed1/react-native-blur', () => {
  const { View } = require('react-native')
  return { BlurView: View }
})

jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default)

// reads the XMLHttpRequest global at import time, which only exists inside React Native
jest.mock('react-native-aws3', () => ({
  RNS3: { put: jest.fn(() => Promise.resolve({ status: 201 })) },
}))
