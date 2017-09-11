export const getUserId = state => state.auth.id;

export const getData = state => state.main.data;
export const getAddNewModalShown = state => state.main.add_new_modal_shown;
export const getRecordingPermissions = state => state.main.recording_permissions;

export const getOriginalPhrase = state => state.form.original;
export const getTranslatedPhrase = state => state.form.translated;
