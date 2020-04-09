import React from 'react'
import { TextInput as NativeTextInput } from 'react-native'

import { smartFontSize } from 'app/utils/functions'
import styles from 'app/styles'
import colors from 'app/styles/colors'

const TextInput = props => {
  return (
    <NativeTextInput
      style={[
        styles.formTextInput,
        {
          fontSize: smartFontSize({
            max: 70,
            min: 24,
            threshold: 7,
            text: props.value,
          }),
        },
      ]}
      underlineColorAndroid="transparent"
      selectionColor={colors.primary_light}
      autoCorrect={false}
      {...props}
      ref={props.textInputRef}
    />
  )
}

export default TextInput
