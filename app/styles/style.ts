import { Dimensions, Platform } from 'react-native'
import { ifIphoneX } from 'react-native-iphone-x-helper'

import { a } from 'app/utils';
import colors from './colors'

const SCREEN_WIDTH = Dimensions.get('window').width
const SCREEN_HEIGHT = Dimensions.get('window').height

export const navBarStyle = {
  backgroundColor: colors.secondary,
  paddingTop: ifIphoneX(40, 20),
  width: SCREEN_WIDTH,
  height: ifIphoneX(80, 60),
  justifyContent: 'space-between',
  alignItems: 'center',
  flexDirection: 'row',
}

export const navBarTitle = {
  color: colors.white,
}

export const container = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: colors.primary,
}

export const flatlist = {
  width: '100%',
  flex: 1,
}

export const flatListContentContainer = {
  backgroundColor: 'transparent',
  paddingBottom: a(0, 0, 0, 30, 30),
}

export const flatlistContent = {
  backgroundColor: colors.primary,
}

export const flatlistEmpty = {
  height: SCREEN_HEIGHT - 64,
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'transparent',
}

export const flatlistPlaceholder = {
  fontSize: 20,
  fontWeight: 'bold',
  textAlign: 'center',
  marginLeft: 10,
  color: colors.primary_light,
}

export const formSlide = {
  flex: 1,
  justifyContent: 'space-around',
  alignItems: 'center',
  width: SCREEN_WIDTH,
  backgroundColor: colors.primary,
}

export const formHeader = {
  textAlign: 'center',
  fontSize: 50,
  color: colors.primary_light,
  marginTop: 50,
}

export const formTextInput = {
  height: 100,
  width: SCREEN_WIDTH,
  backgroundColor: colors.primary_dark,
  color: '#eee',
  fontSize: 70,
  textAlign: 'center',
  marginTop: -30,
}

export const button = {
  width: 200,
  height: 50,
}

export const buttonDisabled = {
  opacity: Platform.OS === 'ios' ? 0.3 : 1,
}

export const shareButtonContainer = {
  width: SCREEN_WIDTH,
  backgroundColor: colors.primary,
  paddingBottom: a(0, 0, 0, 30, 30),
}

export const formRecordButtonContainer = {
  width: SCREEN_WIDTH,
  height: 200,
}

export const formCircleProgress = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  marginLeft: -60,
  marginTop: -60,
}

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
  alignItems: 'center',
}

export const resetButton = {
  position: 'absolute',
  left: '75%',
  top: '50%',
  marginLeft: 20,
  marginTop: 20,
}

export const noPermissionsTitle = {
  fontSize: 30,
  color: colors.white,
  textAlign: 'center',
  marginTop: 20,
}

export const noPermissionsSubtitle = {
  fontSize: 20,
  color: colors.white,
  textAlign: 'center',
  marginHorizontal: 20,
  opacity: 0.9,
}

export const modalContainer = {
  flex: 1,
  alignItems: 'center',
  justifyContent: 'center',
  padding: 20,
}

export const modalTitle = {
  fontSize: 30,
  textAlign: 'center',
  marginBottom: 20,
  color: colors.white,
}

export const modalSubtitle = {
  fontSize: 20,
  textAlign: 'center',
  marginBottom: 40,
  color: colors.white,
  opacity: 0.9,
}
