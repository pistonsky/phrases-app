import qs from 'qs';
import axios from 'axios';
import * as config from '../utils/config';

export const addPhrase = async (phrase, user_id) => {
  const query = qs.stringify({ ...phrase, user_id });
  const url = config.BASE_URL + '/?' + query;
  const result = await axios.post(url);
  return result.data._id;
};

export const getPhrases = async user_id => {
  const query = qs.stringify({ user_id });
  const url = config.BASE_URL + '/?' + query;
  const result = await axios.get(url);
  return result.data;
};
