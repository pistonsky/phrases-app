import { Dimensions, Platform } from 'react-native';
import colors from './colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export const container = {
  flex: 1,
  flexDirection: 'column',
  justifyContent: 'space-between',
  alignItems: 'center'
};

export const topContainer = {
  height: 50,
  width: SCREEN_WIDTH
};

export const centerContainer = {
  height: 200,
  width: SCREEN_WIDTH,
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center'
};

export const bottomContainer = {
  height: 100,
  width: SCREEN_WIDTH,
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center'
};

export const originalContainer = {
  width: SCREEN_WIDTH,
  height: 100,
  backgroundColor: 'rgba(0, 0, 0, 0.1)',
  justifyContent: 'center',
  alignItems: 'center',
  position: 'relative'
};

export const touchable = {
  flex: 1,
  paddingVertical: 20,
  justifyContent: 'center',
  alignItems: 'center',
  width: SCREEN_WIDTH
};

export const playContainer = {
  height: 140,
  width: SCREEN_WIDTH,
  justifyContent: 'center',
  alignItems: 'center'
};

export const resetContainer = {
  position: 'absolute',
  left: '65%',
  right: 0,
  top: 0,
  height: 140,
  alignItems: 'center',
  justifyContent: 'center',
  opacity: 0.5
};

export const cancelContainer = {
  opacity: 0.5,
  flexDirection: 'column',
  alignItems: 'center',
  marginBottom: 10,
  marginHorizontal: 20
};

export const iconLabel = {
  color: colors.white,
  fontSize: 12
};
