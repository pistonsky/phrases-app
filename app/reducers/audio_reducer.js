import { AUDIO_CACHED } from 'app/actions/types'

const INITIAL_STATE = {
  cache: {},
}

export default function (state = INITIAL_STATE, action) {
  switch (action.type) {
    case AUDIO_CACHED:
      return {
        ...state,
        cache: { ...state.cache, [action.uri]: action.localUri },
      }

    default:
      return state
  }
}
