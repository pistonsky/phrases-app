import { Platform } from 'react-native'

// What the layout assumed before notches. Android still uses it: AppRouter makes room for its status bar.
const LEGACY_INSETS = { top: 20, bottom: 0 }

// Room taken by the status bar (or the notch / Dynamic Island) at the top and the home indicator at the bottom,
// given the insets from react-native-safe-area-context
export default function screenInsets(insets) {
  return Platform.OS === 'ios' && insets ? insets : LEGACY_INSETS
}
