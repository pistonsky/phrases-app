import { Facebook } from 'expo';
import { Actions } from 'react-native-router-flux';
import * as api from '../api';
import {
  SKIP_WELCOME_SCREENS,
  FACEBOOK_CONNECT
} from './types';

export const skipWelcomeScreen = () => async dispatch => {
  dispatch({ type: SKIP_WELCOME_SCREENS }); // this effectively creates a user
  Actions.main();
}

export const connectFacebook = (user_id) => async dispatch => {
  let {
    type,
    token
  } = await Facebook.logInWithReadPermissionsAsync('672834932920089', {
    permissions: ['public_profile', 'email'],
    behavior: 'web' // use 'native' when ready for production
  });

  if (type !== 'cancel') {
    const { data: { user_id } } = await api.connectFacebook(token, user_id);
    dispatch({ type: FACEBOOK_CONNECT }); // sets 'facebook_connected' flag
  }
}
