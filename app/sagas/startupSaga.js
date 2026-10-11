import { all, take, select, call, fork, delay } from 'redux-saga/effects'
import { REHYDRATE } from 'redux-persist'
import BootSplash from 'react-native-bootsplash'
import { getUserId } from 'app/reducers/selectors'
import { resetTo } from 'app/navigation'
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
    yield call(resetTo, 'main')
  } else {
    yield delay(1000) // for some reason, we have to wait. 1 second is the best value from UX standpoint
    yield call(resetTo, 'welcome')
  }
  BootSplash.hide();
  yield fork(shareSaga);
  yield fork(audioSaga);
  yield fork(playAllSaga);
  yield call(syncSaga);
}

export default startupSaga
