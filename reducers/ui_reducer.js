import {
  TOGGLE_DICTIONARY_SELECTOR,
  ADD_DICTIONARY,
  SELECT_DICTIONARY
} from '../actions/types';

const INITIAL_STATE = {
  show_dictionaries_selector: false
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

    default:
      return state;
  }
}
