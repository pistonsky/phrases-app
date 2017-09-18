import {
  OPEN_ADD_NEW_MODAL,
  CLOSE_ADD_NEW_MODAL,
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  ADD_NEW_PHRASE,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES,
  DATA_LOADING,
  DATA_LOADED,
  DELETE_PHRASE,
  SKIP_LOADING_SCREENS
} from '../actions/types';
import colors from '../styles/colors';

const INITIAL_STATE = {
  add_new_modal_shown: false,
  recording_permissions: false,
  data: [],
  data_loading: true,
  guide: [
    {
      head: 'Фразочки',
      body: 'Учите иностранный\nс иностранцами',
      background: colors.primary_dark
    },
    {
      head: 'Оттачивайте произношение',
      body: 'Спросите местного\nкак это произносится',
      background: colors.secondary_dark
    },
    {
      head: 'Делитесь\nс друзьями',
      body: 'Передавайте собранные фразочки своим друзьям',
      background: colors.primary
    }
  ]
};

export default function(state = INITIAL_STATE, action) {
  switch (action.type) {
    case RECORDING_PERMISSIONS_GRANTED:
      return { ...state, recording_permissions: true };

    case RECORDING_PERMISSIONS_DENIED:
      return { ...state, recording_permissions: false };

    case SKIP_LOADING_SCREENS:
      return { ...state, data_loading: false };

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

    case ADD_SHARED_PHRASE:
      return {
        ...state,
        data: [
          ...state.data,
          {
            original: action.original,
            translated: action.translated,
            uri: action.uri
          }
        ]
      };

    case ADD_SHARED_PHRASES:
      return {
        ...state,
        data: [...state.data, ...action.phrases]
      };

    case DATA_LOADED:
      return {
        ...state,
        data: action.phrases,
        data_loading: false
      };

    case DELETE_PHRASE:
      let data = state.data.filter(e => e.uri !== action.payload.uri);
      return { ...state, data };

    case DATA_LOADING:
      return { ...state, data_loading: true };

    default:
      return state;
  }
}
