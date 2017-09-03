import {
  OPEN_ADD_NEW_MODAL,
  CLOSE_ADD_NEW_MODAL,
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  ADD_NEW_PHRASE
} from '../actions/types';

const INITIAL_STATE = {
  add_new_modal_shown: false,
  recording_permissions: false,
  data: []
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case RECORDING_PERMISSIONS_GRANTED:
      return { ...state, recording_permissions: true };

    case RECORDING_PERMISSIONS_DENIED:
      return { ...state, recording_permissions: false };

    case OPEN_ADD_NEW_MODAL:
      return { ...state, add_new_modal_shown: true };

    case CLOSE_ADD_NEW_MODAL:
      return { ...state, add_new_modal_shown: false };

    case ADD_NEW_PHRASE:
      return {
        ...state,
        add_new_modal_shown: false,
        data: [
          ...state.data,
          {
            original: action.original,
            translated: action.translated,
            uri: action.uri,
            localUri: action.localUri,
            recording: action.recording
          }
        ]
      };

    default:
      return state;
  }
}
