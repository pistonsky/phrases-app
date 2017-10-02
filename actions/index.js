import { Facebook } from 'expo';
import { Actions } from 'react-native-router-flux';
import { Alert } from 'react-native';
import * as api from '../api';
import {
  SKIP_WELCOME_SCREENS,
  FACEBOOK_CONNECT,
  FACEBOOK_LOGIN,
  FACEBOOK_CONNECT_IN_PROGRESS,
  FACEBOOK_CONNECT_IGNORED,
  FACEBOOK_CONNECT_FAILED,
  DATA_LOADING,
  DATA_LOADED,
  DATA_LOADING_FAILED,
  DELETE_PHRASE
} from './types';

const facebookLogin = () =>
  Facebook.logInWithReadPermissionsAsync('672834932920089', {
    permissions: ['public_profile', 'email'],
    behavior: 'native' // use 'native' when ready for production
  });

export const skipWelcomeScreen = () => async dispatch => {
  dispatch({ type: SKIP_WELCOME_SCREENS }); // this effectively creates a user
  Actions.main();
};

export const connectFacebook = user_id => async dispatch => {
  let { type, token } = await facebookLogin();
  if (type === 'cancel') {
    dispatch({ type: FACEBOOK_CONNECT_FAILED });
  } else {
    dispatch({ type: FACEBOOK_CONNECT_IN_PROGRESS });
    try {
      const { status, data: { phrases } } = await api.connectFacebook(token, user_id);
      if (status !== 200) throw status;
      dispatch({ type: FACEBOOK_CONNECT }); // sets 'facebook_connected' flag
      dispatch({ type: DATA_LOADED, phrases });
    } catch (e) {
      dispatch({ type: FACEBOOK_CONNECT_FAILED });
      requestAnimationFrame(() => {
        Alert.alert(
          'Login Failed =(',
          "We couldn't log you in this time. Please check your signal or try to find wi-fi."
        );
      });
    }
  }
};

export const loginWithFacebook = () => async dispatch => {
  let { type, token } = await facebookLogin();
  if (type === 'cancel') {
    dispatch({ type: FACEBOOK_CONNECT_FAILED });
  } else {
    dispatch({ type: FACEBOOK_CONNECT_IN_PROGRESS });
    try {
      const { status, data } = await api.connectFacebook(token);
      if (status !== 200) throw status;
      Actions.main();
      dispatch({ type: FACEBOOK_LOGIN, user_id: data.user_id });
      dispatch({ type: DATA_LOADED, phrases: data.phrases });
    } catch (e) {
      dispatch({ type: FACEBOOK_CONNECT_FAILED });
      requestAnimationFrame(() => {
        Alert.alert(
          'Login Failed =(',
          "We couldn't log you in this time. Please check your signal or try to find wi-fi."
        );
      });
    }
  }
};

export const ignoreConnectFacebook = () => {
  return {
    type: FACEBOOK_CONNECT_IGNORED
  };
};

export const refreshPhrases = user_id => async dispatch => {
  dispatch({ type: DATA_LOADING });
  try {
    const { data: { phrases } } = await api.getPhrases(user_id);
    dispatch({ type: DATA_LOADED, phrases });
  } catch (e) {
    dispatch({ type: DATA_LOADING_FAILED });
  }
};

export const deletePhrase = phrase => async dispatch => {
  dispatch({ type: DELETE_PHRASE, payload: phrase });
  const result = await api.deletePhrase(phrase);
};
