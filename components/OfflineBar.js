import React from 'react';
import { View, Text } from 'react-native';
import colors from '../styles/colors';

const OfflineBar = props => {
  return (
    <View
      style={{
        width: '100%',
        height: 12,
        backgroundColor: colors.grey,
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <Text style={{ fontSize: 8, color: colors.white }}>OFFLINE MODE</Text>
    </View>
  );
};

export default OfflineBar;
