import { randomId } from '../utils/functions';
import {
  SKIP_WELCOME_SCREENS,
  FACEBOOK_CONNECT
} from '../actions/types';

const INITIAL_STATE = {
  id: null,
  facebook_connected: false
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case SKIP_WELCOME_SCREENS:
      return {
        ...state,
        id: randomId()
      };

    case FACEBOOK_CONNECT:
      return {
        ...state,
        facebook_connected: true
      };

    default:
      return state;
  }
}
