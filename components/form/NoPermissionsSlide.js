import React from 'react';
import { Platform, View, Text, Image, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-elements';

import { Button } from '../index';
import styles from '../../styles';
import colors from '../../styles/colors';

const NoPermissionsSlide = props => {
  return (
    <View style={styles.formSlide}>
      <Text style={styles.noPermissionsTitle}>No Microphone</Text>
      <Text style={styles.noPermissionsSubtitle}>
        Please allow to use microphone to record the native speaker's
        voice for this phraze!
      </Text>
      {Platform.OS === 'ios' ? (
        <Image source={require('../../assets/microphone.png')} />
      ) : null}
      <Button
        style={{ marginBottom: 10 }}
        onPress={props.onPress}
        title="Enable Microphone"
      />
      <TouchableOpacity onPress={props.onCancel}>
        <View style={{ opacity: 0.7, flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
          <Icon name='ios-close-circle' type='ionicon' size={30} color={colors.white} />
          <Text style={{ color: colors.white, fontSize: 12 }}>Cancel</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default NoPermissionsSlide;
