import {
  FORM_ORIGINAL_CHANGED,
  FORM_TRANSLATED_CHANGED,
  ADD_NEW_PHRASE
} from '../actions/types';

const INITIAL_STATE = {
  original: '',
  translated: ''
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FORM_ORIGINAL_CHANGED:
      return { ...state, original: action.payload };

    case FORM_TRANSLATED_CHANGED:
      return { ...state, translated: action.payload };

    case ADD_NEW_PHRASE:
      return INITIAL_STATE;

    default:
      return state;
  }
}
