import { combineReducers } from 'redux';
import auth from './auth_reducer';
import main from './main_reducer';
import item_screen from './item_screen_reducer';
import form from './form_reducer';

export default combineReducers({
  auth,
  main,
  item_screen,
  form
});
