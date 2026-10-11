import { CommonActions, createNavigationContainerRef } from '@react-navigation/native'

export const navigationRef = createNavigationContainerRef()

// Switches to the given screen and drops the history, the same way
// react-native-router-flux tabs used to (there is no "back" from main to welcome).
export function resetTo(name) {
  if (navigationRef.isReady()) {
    navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name }] }))
  }
}
