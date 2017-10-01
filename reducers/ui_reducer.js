import {
  TOGGLE_DICTIONARY_SELECTOR,
  ADD_DICTIONARY,
  SELECT_DICTIONARY,
  SHOW_RECORDING_PERMISSIONS_MODAL,
  RECORDING_PERMISSIONS_DENIED,
  RECORDING_PERMISSIONS_GRANTED,
  HIDE_SYNC_MODAL,
  SHOW_SYNC_MODAL
} from '../actions/types';

const INITIAL_STATE = {
  show_dictionaries_selector: false,
  show_recording_permissions_modal: false,
  show_sync_modal: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case TOGGLE_DICTIONARY_SELECTOR:
      return {
        ...state,
        show_dictionaries_selector: !state.show_dictionaries_selector
      };

    case ADD_DICTIONARY:
    case SELECT_DICTIONARY:
      return { ...state, show_dictionaries_selector: false };

    case SHOW_RECORDING_PERMISSIONS_MODAL:
      return { ...state, show_recording_permissions_modal: true };

    case RECORDING_PERMISSIONS_DENIED:
    case RECORDING_PERMISSIONS_GRANTED:
      return { ...state, show_recording_permissions_modal: false };

    case SHOW_SYNC_MODAL:
      return { ...state, show_sync_modal: true };

    case HIDE_SYNC_MODAL:
      return { ...state, show_sync_modal: false };

    default:
      return state;
  }
}
