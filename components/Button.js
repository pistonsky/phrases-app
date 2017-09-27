import React from 'react';
import { Platform } from 'react-native';
import { Button as BaseButton } from 'react-native-elements';

import styles from '../styles';
import colors from '../styles/colors';

const Button = props => {
  return (
    <BaseButton
      backgroundColor={colors.secondary}
      buttonStyle={[styles.button, props.style]}
      disabledStyle={styles.buttonDisabled}
      raised
      large
      fontWeight="bold"
      borderRadius={Platform.OS === 'ios' ? 30 : 0}
      {...props}
    />
  );
};

export default Button;
