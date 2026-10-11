import React from 'react'
import { Platform, View, Text, Image, TouchableOpacity } from 'react-native'
import { Icon } from 'react-native-elements'

import { Button } from 'app/components'
import styles from 'app/styles'
import colors from 'app/styles/colors'
import I18n from 'app/utils/i18n'

const NoPermissionsSlide = ({ onCancel, onPress }) => {
  return (
    <View style={styles.formSlide}>
      <Text style={styles.noPermissionsTitle}>{I18n.t('No Microphone')}</Text>
      <Text style={styles.noPermissionsSubtitle}>
        {I18n.t("Please allow to use microphone to record the native speaker's voice for this phraze!")}
      </Text>
      {Platform.OS === 'ios' ? <Image source={require('assets/microphone.png')} /> : null}
      <Button onPress={onPress} title={I18n.t('Enable Microphone')} />
      <TouchableOpacity onPress={onCancel}>
        <View style={{ opacity: 0.7, flexDirection: 'column', alignItems: 'center', marginBottom: 10 }}>
          <Icon name="ios-close-circle" type="ionicon" size={30} color={colors.white} />
          <Text style={{ color: colors.white, fontSize: 12 }}>{I18n.t('Cancel')}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}

export default NoPermissionsSlide
