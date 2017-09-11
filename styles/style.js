import { Dimensions } from 'react-native';
import colors from './colors';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const navBarStyle = {
  backgroundColor: colors.secondary
};

export const navBarTitle = {
  color: colors.white
};

export const container = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.primary
};

export const flatlist = {
  width: '100%',
  flex: 1
};

export const flatlistContent = {
  backgroundColor: colors.primary
};

export const flatlistEmpty = {
  height: 600,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent'
};

export const flatlistPlaceholder = {
  fontSize: 20,
  fontWeight: 'bold',
  color: colors.primary_light
};

export const formSlide = {
  flex: 1,
  justifyContent: 'center',
  alignItems: 'center',
  width: SCREEN_WIDTH,
  backgroundColor: colors.primary
};

export const formHeader = {
  textAlign: 'center',
  fontSize: 50,
  color: colors.primary_light
};

export const formTextInput = {
  height: 100,
  width: SCREEN_WIDTH,
  margin: 50,
  backgroundColor: colors.primary_dark,
  color: '#eee',
  fontSize: 70,
  textAlign: 'center'
};

export const button = {
  width: 200,
  height: 50
};

export const formRecordButtonContainer = {
  width: SCREEN_WIDTH,
  height: 200
};

export const formCircleProgress = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  marginLeft: -60,
  marginTop: -60
};

export const recordButton = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  width: 100,
  height: 100,
  marginLeft: -50,
  marginTop: -50,
  borderRadius: 50,
  backgroundColor: '#f00',
  justifyContent: 'center',
  alignItems: 'center'
};

export const noPermissionsText = {
  fontSize: 40,
  color: colors.white,
  textAlign: 'center',
  margin: 20
};