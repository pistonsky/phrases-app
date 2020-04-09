import { LoginManager, AccessToken } from 'react-native-fbsdk'
import { Actions } from 'react-native-router-flux'
import { Alert, AlertIOS } from 'react-native'
import * as api from 'app/api'
import { getUserId } from 'app/reducers/selectors'
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
  DELETE_PHRASE,
  DELETE_DICTIONARY,
  UPDATE_DICTIONARY_NAME,
  COPY_DICTIONARY_AS_TEMPLATE,
  TOGGLE_DICTIONARY_SELECTOR,
} from 'app/actions/types'
import { store } from 'app/redux'

const facebookLogin = () => {
  return LoginManager.logInWithPermissions(['public_profile', 'email']) // 672834932920089 - App ID
}

export const skipWelcomeScreen = () => async dispatch => {
  dispatch({ type: SKIP_WELCOME_SCREENS }) // this effectively creates a user
  Actions.main()
}

export const connectFacebook = user_id => async dispatch => {
  let { type, token } = await facebookLogin()
  console.log('connectFacebook', type, token)
  if (type === 'cancel') {
    dispatch({ type: FACEBOOK_CONNECT_FAILED })
  } else {
    dispatch({ type: FACEBOOK_CONNECT_IN_PROGRESS })
    try {
      const {
        status,
        data: { phrases },
      } = await api.connectFacebook(token, user_id)
      if (status !== 200) throw status
      dispatch({ type: FACEBOOK_CONNECT }) // sets 'facebook_connected' flag
      dispatch({ type: DATA_LOADED, phrases })
    } catch (e) {
      dispatch({ type: FACEBOOK_CONNECT_FAILED })
      requestAnimationFrame(() => {
        Alert.alert(
          'Login Failed =(',
          "We couldn't log you in this time. Please check your signal or try to find wi-fi.",
        )
      })
    }
  }
}

export const loginWithFacebook = () => async dispatch => {
  const { isCancelled } = await facebookLogin()
  if (isCancelled) {
    dispatch({ type: FACEBOOK_CONNECT_FAILED })
  } else {
    dispatch({ type: FACEBOOK_CONNECT_IN_PROGRESS })
    try {
      const { accessToken } = await AccessToken.getCurrentAccessToken()
      const { status, data } = await api.connectFacebook(accessToken)
      if (status !== 200) throw status
      Actions.main()
      dispatch({ type: FACEBOOK_LOGIN, user_id: data.user_id })
      dispatch({ type: DATA_LOADED, phrases: data.phrases })
    } catch (e) {
      dispatch({ type: FACEBOOK_CONNECT_FAILED })
      // eslint-disable-next-line no-undef
      requestAnimationFrame(() => {
        Alert.alert(
          'Login Failed =(',
          "We couldn't log you in this time. Please check your signal or try to find wi-fi.",
        )
      })
    }
  }
}

export const ignoreConnectFacebook = () => {
  return {
    type: FACEBOOK_CONNECT_IGNORED,
  }
}

export const refreshPhrases = user_id => async dispatch => {
  dispatch({ type: DATA_LOADING })
  try {
    const {
      data: { phrases },
    } = await api.getPhrases({ user_id })
    dispatch({ type: DATA_LOADED, phrases })
  } catch (e) {
    dispatch({ type: DATA_LOADING_FAILED })
  }
}

export const deletePhrase = phrase => async dispatch => {
  dispatch({ type: DELETE_PHRASE, payload: phrase })
  const result = await api.deletePhrase(phrase)
}

export const deleteDictionary = ({ dictionary_name }) => async dispatch => {
  const user_id = getUserId(store.getState())
  Alert.alert(
    'Delete Forever?',
    `This will remove all phrases in "${dictionary_name}". This action cannot be undone. Sure?`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          dispatch({ type: DELETE_DICTIONARY, payload: dictionary_name })
          const result = await api.deleteDictionary({
            dictionary_name,
            user_id,
          })
        },
      },
    ],
  )
}

export const updateDictionaryName = ({ old_name, new_name }) => async dispatch => {
  const user_id = getUserId(store.getState())
  dispatch({ type: UPDATE_DICTIONARY_NAME, old_name, new_name })
  const result = await api.updateDictionary({ old_name, new_name, user_id })
}

export const copyDictionaryAsTemplate = ({ dictionary_name }) => async dispatch => {
  AlertIOS.prompt(
    'Enter new dictionary name',
    'The selected dictionary will be used as a template for the new dictionary: it will contain all the same phrases in original language.',
    [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Copy',
        onPress: new_dictionary_name => {
          dispatch({
            type: COPY_DICTIONARY_AS_TEMPLATE,
            payload: { dictionary_name, new_dictionary_name },
          })
          dispatch({ type: TOGGLE_DICTIONARY_SELECTOR })
        },
      },
    ],
  )
}
