import { combineReducers } from 'redux';
import main from './main_reducer';
import item_screen from './item_screen_reducer';

export default combineReducers({
  main,
  item_screen
});
