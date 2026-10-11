import { all, take, select, call, fork, delay } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'
import SplashScreen from 'react-native-splash-screen'
import { getUserId } from 'app/reducers/selectors'
import { Actions } from 'react-native-router-flux'
import { ROUTER_READY } from 'app/actions/types'

import audioSaga from 'app/sagas/audioSaga'
import playAllSaga from 'app/sagas/playAllSaga'
import syncSaga from 'app/sagas/syncSaga'
import shareSaga from 'app/sagas/shareSaga'

const startupSaga = function* startupSaga() {
  yield all([take(ROUTER_READY), take(REHYDRATE)])
  const user_id = yield select(getUserId)
  if (user_id) {
    yield delay(1000) // for some reason, we have to wait. 1 second is the best value from UX standpoint
    yield call(Actions.main)
  } else {
    yield delay(1000) // for some reason, we have to wait. 1 second is the best value from UX standpoint
    yield call(Actions.welcome)
  }
  SplashScreen.hide();
  yield fork(shareSaga);
  yield fork(audioSaga);
  yield fork(playAllSaga);
  yield call(syncSaga);
}

export default startupSaga
