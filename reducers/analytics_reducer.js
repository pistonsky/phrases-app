import {
  FACEBOOK_CONNECT_IGNORED,
  ADD_NEW_PHRASE,
  SHARE_PHRASE,
  SHARE_ALL_PHRASES
} from '../actions/types';

const INITIAL_STATE = {
  show_facebook_modal: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case FACEBOOK_CONNECT_IGNORED:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: false
      };

    case ADD_NEW_PHRASE:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    case SHARE_PHRASE:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    case SHARE_ALL_PHRASES:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1,
        show_facebook_modal: [1, 5, 10].indexOf((state[action.type] || 0) + 1) !== -1
      };

    default:
      return {
        ...state,
        [action.type]: (state[action.type] || 0) + 1
      };
  }
}
