import {
  OPEN_ADD_NEW_MODAL,
  CLOSE_ADD_NEW_MODAL,
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  ADD_NEW_PHRASE,
  ADD_SHARED_PHRASE,
  ADD_SHARED_PHRASES,
  ADD_SHARED_DICTIONARY,
  PHRASE_UPLOADED,
  PHRASE_SYNCED,
  DATA_LOADING,
  DATA_LOADED,
  DATA_LOADING_FAILED,
  UPDATE_PHRASE,
  UPDATE_PHRASE_KEEP_MODAL_OPEN,
  DELETE_PHRASE,
  SKIP_WELCOME_SCREENS,
  ADD_DICTIONARY,
  SELECT_DICTIONARY,
  DELETE_DICTIONARY,
  UPDATE_DICTIONARY_NAME,
  GO_ONLINE,
  GO_OFFLINE,
  TOGGLE_DICTIONARY_SELECTOR,
  COPY_DICTIONARY_AS_TEMPLATE,
} from 'app/actions/types'
import colors from 'app/styles/colors'
import { randomId } from 'app/utils/functions'
import I18n from 'app/utils/i18n'

const SHARED_DICTIONARY_NAME = I18n.t('Added')
const DEFAULT_DICTIONARY_NAME = I18n.t('Phrazes')

const INITIAL_STATE = {
  add_new_modal_shown: false,
  recording_permissions: undefined,
  offline: undefined,
  data: [],
  data_loading: true,
  dictionaries: [{ name: DEFAULT_DICTIONARY_NAME, selected: true }],
  guide: [
    {
      head: 'Phrazes',
      body: I18n.t('Learn languages with natives\nphrase by phrase'),
      background: colors.primary_dark,
    },
    {
      head: I18n.t('Connect with locals'),
      body: I18n.t('Ask them to give you some phrases\nthen record how they pronounce it'),
      // body: 'Say goodbye to dictionaries\nlearn from locals',
      background: colors.secondary_dark,
    },
    {
      head: I18n.t('Share with friends'),
      body: I18n.t('Pass on all your handy phrazes\nand discover new ones'),
      background: colors.primary,
    },
  ],
}

export default function (state = INITIAL_STATE, action) {
  let data
  let dictionaries
  switch (action.type) {
    case RECORDING_PERMISSIONS_GRANTED:
      return { ...state, recording_permissions: true }

    case RECORDING_PERMISSIONS_DENIED:
      return { ...state, recording_permissions: false }

    case SKIP_WELCOME_SCREENS:
      return { ...state, data_loading: false }

    case OPEN_ADD_NEW_MODAL:
      return { ...state, add_new_modal_shown: true }

    case CLOSE_ADD_NEW_MODAL:
      return { ...state, add_new_modal_shown: false }

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
            synced: action.synced === undefined ? true : action.synced,
          },
        ],
      }

    case ADD_SHARED_PHRASE:
      return {
        ...state,
        data: [
          ...state.data,
          {
            original: action.original,
            translated: action.translated,
            uri: action.uri,
            dictionary: state.dictionaries.find(e => e.selected).name,
          },
        ],
      }

    case ADD_SHARED_PHRASES: {
      // determine the largest dictionary among shared phrases and make it selected
      const shared_dictionaries = {}
      for (const shared_phrase of action.phrases) {
        if (!(shared_phrase.dictionary in shared_dictionaries)) {
          shared_dictionaries[shared_phrase.dictionary] = 0
        }
        shared_dictionaries[shared_phrase.dictionary] += 1
      }
      let largest_shared_dictionary
      for (const d in shared_dictionaries) {
        if (
          largest_shared_dictionary === undefined
          || shared_dictionaries[d] > shared_dictionaries[largest_shared_dictionary]
        ) {
          largest_shared_dictionary = d
        }
      }
      data = [...state.data, ...action.phrases.map(e => ({ ...e, synced: false, uploaded: true }))]
      dictionaries = [...new Set(data.map(e => e.dictionary || INITIAL_STATE.dictionaries[0].name))].map(e => ({
        name: e,
        selected: e === largest_shared_dictionary,
      }))
      return { ...state, data, dictionaries }
    }

    case ADD_SHARED_DICTIONARY: {
      const shared_dictionary_name = action.phrases[0].dictionary
      return {
        ...state,
        data: [...state.data, ...action.phrases.map(e => ({ ...e, synced: false, uploaded: true }))],
        dictionaries: [...state.dictionaries, { name: shared_dictionary_name }].map(e => {
          return { ...e, selected: e.name === shared_dictionary_name }
        }),
      }
    }

    case DATA_LOADED: {
      const selected_dictionary = state.dictionaries.find(e => e.selected).name
      const loaded_dictionaries = [
        ...new Set(action.phrases.map(e => e.dictionary || INITIAL_STATE.dictionaries[0].name)),
      ]
      if (loaded_dictionaries.length) {
        // determine what dictionary to select
        if (loaded_dictionaries.indexOf(selected_dictionary) !== -1) {
          dictionaries = loaded_dictionaries.map(e => {
            return { name: e, selected: e === selected_dictionary }
          })
        } else {
          // select the largest dictionary
          const largest_dictionary = action.phrases.reduce(
            (accumulator, currentValue) => {
              const currentCount = (accumulator[currentValue.dictionary] || 0) + 1
              return {
                ...accumulator,
                [currentValue.dictionary]: currentCount,
                _largest:
                  currentCount > accumulator._largest.count
                    ? { name: currentValue.dictionary, count: currentCount }
                    : accumulator._largest,
              }
            },
            { _largest: { name: INITIAL_STATE.dictionaries[0].name, count: 0 } },
          )._largest.name
          dictionaries = loaded_dictionaries.map(e => {
            return { name: e, selected: e === largest_dictionary }
          })
        }
      } else {
        dictionaries = [...state.dictionaries]
      }
      return {
        ...state,
        data: action.phrases,
        dictionaries,
        data_loading: false,
      }
    }

    case DATA_LOADING_FAILED:
      return { ...state, data_loading: false }

    case UPDATE_PHRASE:
    case UPDATE_PHRASE_KEEP_MODAL_OPEN:
      return {
        ...state,
        data: state.data.map(e => e.uri === action.phrase.uri
            ? {
                ...e,
                ...action.update,
                uploaded: !action.audio_modified,
                synced: false,
              }
            : e,
        ),
      }

    case DELETE_PHRASE:
      return {
        ...state,
        data: state.data.filter(e => e.uri !== action.payload.uri),
      }

    case PHRASE_UPLOADED:
      return {
        ...state,
        data: state.data.map(e => {
          if (e.uri === action.uri) {
            return { ...e, uploaded: true }
          }
          return e
        }),
      }

    case PHRASE_SYNCED:
      return {
        ...state,
        data: state.data.map(e => {
          if (e.uri === action.uri) {
            return { ...e, synced: true }
          }
          return e
        }),
      }

    case DATA_LOADING:
      return { ...state, data_loading: true }

    case ADD_DICTIONARY:
      return {
        ...state,
        dictionaries: [
          ...state.dictionaries.map(e => {
            return { ...e, selected: false }
          }),
          { name: action.name, selected: true },
        ],
      }

    case SELECT_DICTIONARY:
      return {
        ...state,
        dictionaries: [
          ...state.dictionaries.map(e => {
            return { ...e, selected: e.name === action.name }
          }),
        ],
      }

    case DELETE_DICTIONARY:
      // 1. delete all phrases of this dictionary
      // 2. delete the dictionary itself
      return {
        ...state,
        data: state.data.filter(e => e.dictionary !== action.payload),
        dictionaries: state.dictionaries.filter(e => e.name !== action.payload),
      }

    case UPDATE_DICTIONARY_NAME: {
      const { old_name, new_name } = action
      return {
        ...state,
        data: state.data.map(e => (e.dictionary === old_name ? { ...e, dictionary: new_name } : e)),
        dictionaries: state.dictionaries.map(e => (e.name === old_name ? { ...e, name: new_name } : e)),
      }
    }

    case TOGGLE_DICTIONARY_SELECTOR:
      // case when user deletes currently selected dictionary but doesn't select any other
      if (state.dictionaries.filter(e => e.selected === true).length === 0) {
        if (state.dictionaries.filter(e => e.name === DEFAULT_DICTIONARY_NAME).length === 0) {
          if (state.dictionaries.filter(e => e.name === SHARED_DICTIONARY_NAME).length === 0) {
            if (state.dictionaries.length > 0) {
              return {
                ...state,
                dictionaries: state.dictionaries.map((e, i) => (i === 0 ? { ...e, selected: true } : e)),
              }
            }
            // no dictionaries left!
            return {
              ...state,
              dictionaries: [{ name: DEFAULT_DICTIONARY_NAME, selected: true }],
            }
          }
          return {
            ...state,
            dictionaries: state.dictionaries.map(e => e.name === SHARED_DICTIONARY_NAME ? { ...e, selected: true } : e,
            ),
          }
        }
        return {
          ...state,
          dictionaries: state.dictionaries.map(e => e.name === DEFAULT_DICTIONARY_NAME ? { ...e, selected: true } : e,
          ),
        }
      }
      return state

    case COPY_DICTIONARY_AS_TEMPLATE:
      return {
        ...state,
        data: [
          ...state.data,
          ...state.data
            .filter(e => e.dictionary === action.payload.dictionary_name)
            .map(e => ({
              ...e,
              translated: '',
              uri: randomId(),
              dictionary: action.payload.new_dictionary_name,
              recorded: false,
              synced: false,
              uploaded: false,
            })),
        ],
        dictionaries: [...state.dictionaries, { name: action.payload.new_dictionary_name }].map(e => {
          return {
            ...e,
            selected: e.name === action.payload.new_dictionary_name,
          }
        }),
      }

    case GO_OFFLINE:
      return { ...state, offline: true }

    case GO_ONLINE:
      return { ...state, offline: false }

    default:
      return state
  }
}
