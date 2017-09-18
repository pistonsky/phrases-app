import { take, select, call } from 'redux-saga/effects';
import { REHYDRATE } from 'redux-persist/constants';
import { getUserId } from '../reducers/selectors';
import { Actions } from 'react-native-router-flux';

const startupSaga = function* startupSaga() {
  yield take(REHYDRATE);
  const user_id = yield select(getUserId);
  if (user_id) {
    yield call(Actions.main);
  } else {
    yield call(Actions.welcome);
  }
}

export default startupSaga;