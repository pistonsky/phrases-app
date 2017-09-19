export const getUserId = state => state.auth.id;
export const getFacebookConnected = state => state.auth.facebook_connected;
export const shouldShowConnectFacebookModal = state =>
  !getFacebookConnected(state) && state.analytics.show_facebook_modal;
export const facebookConnectInProgress = state =>
  state.auth.facebook_connect_in_progress;

export const getDataLoading = state => state.main.data_loading;
export const getAddNewModalShown = state => state.main.add_new_modal_shown;
export const getRecordingPermissions = state =>
  state.main.recording_permissions;

export const getOriginalPhrase = state => state.form.original;
export const getTranslatedPhrase = state => state.form.translated;

export const getWelcomeScreens = state => state.main.guide;

export const getDictionaries = state => state.main.dictionaries;
export const shouldShowDictionariesSelectorModal = state =>
  state.ui.show_dictionaries_selector;
export const getCurrentDictionaryName = state => {
  return (state.main.dictionaries.find(e => e.selected) || {
    name: 'Phrazes',
    selected: true
  }).name;
};

export const getData = state => {
  const currentDictionaryName = getCurrentDictionaryName(state);
  return state.main.data.filter(e => e.dictionary == currentDictionaryName);
};
