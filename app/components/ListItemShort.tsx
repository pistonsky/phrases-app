import React from 'react'
import { TouchableHighlight, View, Text } from 'react-native'
import FontAwesome from 'react-native-vector-icons/FontAwesome'

const NOT_YET_LOADED_OPACITY = 0.9

const ListItemShort = props => {
  const { item, loaded, uploaded } = props
  const { original, translated } = item
  const short = original.length + translated.length < 26
  if (short) {
    return (
      <TouchableHighlight
        style={[
          styles.container,
          {
            opacity: loaded ? 1 : NOT_YET_LOADED_OPACITY,
            backgroundColor: uploaded ? '#eee' : '#fee',
          },
        ]}
        activeOpacity={1}
        underlayColor="#ddd"
        onPress={() => props.onPress()}
        onLongPress={() => props.onLongPress()}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{original}</Text>
          <FontAwesome name="long-arrow-right" size={20} color="#4af" style={{ backgroundColor: 'transparent' }} />
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{translated}</Text>
        </View>
      </TouchableHighlight>
    )
  }
  return (
    <TouchableHighlight
      style={[
        styles.container,
        {
          opacity: loaded ? 1 : NOT_YET_LOADED_OPACITY,
          backgroundColor: uploaded ? '#eee' : '#fee',
        },
      ]}
      activeOpacity={1}
      underlayColor="#ddd"
      onPress={() => props.onPress()}
      onLongPress={() => props.onLongPress()}
    >
      <View style={{ flexDirection: 'column', justifyContent: 'flex-start' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }} numberOfLines={1}>
          {original}
        </Text>
        <Text style={{ fontSize: 15, color: '#444' }} numberOfLines={1}>
          {translated}
        </Text>
      </View>
    </TouchableHighlight>
  )
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10,
  },
}

export default ListItemShort
