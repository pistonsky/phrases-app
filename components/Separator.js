import React from 'react';
import { View } from 'react-native';

const Separator = props => {
  return (
    <View style={{ width: '100%', height: 1, backgroundColor: 'lightgrey', ...props.style }} />
  );
};

export default Separator;
