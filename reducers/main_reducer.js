import {
  OPEN_ADD_NEW_MODAL,
  CLOSE_ADD_NEW_MODAL,
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  ADD_NEW_PHRASE,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES,
  PHRASE_UPLOADED,
  PHRASE_SYNCED,
  DATA_LOADING,
  DATA_LOADED,
  DATA_LOADING_FAILED,
  DELETE_PHRASE,
  SKIP_WELCOME_SCREENS,
  ADD_DICTIONARY,
  SELECT_DICTIONARY,
  GO_ONLINE,
  GO_OFFLINE
} from '../actions/types';
import colors from '../styles/colors';

const SHARED_DICTIONARY_NAME = 'Added';

const INITIAL_STATE = {
  add_new_modal_shown: false,
  recording_permissions: undefined,
  offline: undefined,
  data: [],
  data_loading: true,
  dictionaries: [{ name: 'Phrazes', selected: true }],
  guide: [
    {
      head: 'Phrazes',
      body: 'Learn languages\nwith natives',
      background: colors.primary_dark
    },
    {
      head: 'Say Accent Bye',
      body: 'Ask locals\nhow to pronounce it',
      background: colors.secondary_dark
    },
    {
      head: 'Share with friends',
      body: 'Pass on all your dirty phrazes\nand discover new ones',
      background: colors.primary
    }
  ]
};

export default function(state = INITIAL_STATE, action) {
  let dictionaries;
  switch (action.type) {
    case RECORDING_PERMISSIONS_GRANTED:
      return { ...state, recording_permissions: true };

    case RECORDING_PERMISSIONS_DENIED:
      return { ...state, recording_permissions: false };

    case SKIP_WELCOME_SCREENS:
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
            recording: action.recording,
            dictionary: state.dictionaries.find(e => e.selected).name,
            synced: action.synced === undefined ? true : action.synced
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
            uri: action.uri,
            dictionary: state.dictionaries.find(e => e.selected).name
          }
        ]
      };

    case ADD_SHARED_PHRASES:
      dictionaries = state.dictionaries.map(e => {
        return { ...e, selected: e.name === SHARED_DICTIONARY_NAME };
      });
      if (
        dictionaries.find(e => e.name === SHARED_DICTIONARY_NAME) === undefined
      ) {
        dictionaries.push({ name: SHARED_DICTIONARY_NAME, selected: true });
      }
      return {
        ...state,
        data: [
          ...state.data,
          ...action.phrases.map(e => {
            return { ...e, dictionary: SHARED_DICTIONARY_NAME };
          })
        ],
        dictionaries
      };

    case DATA_LOADED:
      const selected_dictionary = state.dictionaries.find(e => e.selected).name;
      const loaded_dictionaries = [
        ...new Set(
          action.phrases.map(
            e => e.dictionary || INITIAL_STATE.dictionaries[0].name
          )
        )
      ];
      if (loaded_dictionaries.length) {
        // determine what dictionary to select
        if (loaded_dictionaries.indexOf(selected_dictionary) !== -1) {
          dictionaries = loaded_dictionaries.map(e => {
            return { name: e, selected: e === selected_dictionary };
          });
        } else {
          // select the largest dictionary
          const largest_dictionary = action.phrases.reduce(
            (accumulator, currentValue) => {
              const currentCount =
                (accumulator[currentValue.dictionary] || 0) + 1;
              return {
                ...accumulator,
                [currentValue.dictionary]: currentCount,
                _largest:
                  currentCount > accumulator._largest.count
                    ? { name: currentValue.dictionary, count: currentCount }
                    : accumulator._largest
              };
            },
            { _largest: { name: INITIAL_STATE.dictionaries[0].name, count: 0 } }
          )._largest.name;
          dictionaries = loaded_dictionaries.map(e => {
            return { name: e, selected: e === largest_dictionary };
          });
        }
      } else {
        dictionaries = [...state.dictionaries];
      }
      return {
        ...state,
        data: action.phrases,
        dictionaries,
        data_loading: false
      };

    case DATA_LOADING_FAILED:
      return { ...state, data_loading: false };

    case DELETE_PHRASE:
      return {
        ...state,
        data: state.data.filter(e => e.uri !== action.payload.uri)
      };

    case PHRASE_UPLOADED:
      return {
        ...state,
        data: state.data.map(e => {
          if (e.uri === action.uri) {
            return { ...e, uploaded: true };
          } else {
            return e;
          }
        })
      };

    case PHRASE_SYNCED:
      return {
        ...state,
        data: state.data.map(e => {
          if (e.uri === action.uri) {
            return { ...e, synced: true };
          } else {
            return e;
          }
        })
      };

    case DATA_LOADING:
      return { ...state, data_loading: true };

    case ADD_DICTIONARY:
      return {
        ...state,
        dictionaries: [
          ...state.dictionaries.map(e => {
            return { ...e, selected: false };
          }),
          { name: action.name, selected: true }
        ]
      };

    case SELECT_DICTIONARY:
      return {
        ...state,
        dictionaries: [
          ...state.dictionaries.map(e => {
            return { ...e, selected: e.name === action.name };
          })
        ]
      };

    case GO_OFFLINE:
      return { ...state, offline: true };

    case GO_ONLINE:
      return { ...state, offline: false };

    default:
      return state;
  }
}
