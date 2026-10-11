import React from 'react'
import { View, Text } from 'react-native'
import colors from 'app/styles/colors'
import I18n from 'app/utils/i18n'

const OfflineBar = () => {
  return (
    <View
      style={{
        width: '100%',
        height: 12,
        backgroundColor: colors.grey,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ fontSize: 8, color: colors.white }}>{I18n.t('OFFLINE MODE')}</Text>
    </View>
  )
}

export default OfflineBar
