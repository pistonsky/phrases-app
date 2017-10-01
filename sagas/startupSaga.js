import { all, take, select, call, fork } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist/constants';
import { getUserId } from '../reducers/selectors';
import { Actions } from 'react-native-router-flux';
import { ROUTER_READY } from '../actions/types';

import { syncSaga, shareSaga } from './index';

const startupSaga = function* startupSaga() {
  yield all([
    take(ROUTER_READY),
    take(REHYDRATE)
  ]);
  const user_id = yield select(getUserId);
  if (user_id) {
    yield call(Actions.main);
  } else {
    yield call(Actions.welcome);
  }
  yield fork(shareSaga);
  yield call(syncSaga);
}

export default startupSaga;
