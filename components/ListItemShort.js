import React from 'react';
import { TouchableHighlight, View, Text } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

const NOT_YET_LOADED_OPACITY = 0.9;

export default (ListItemShort = props => {
  const { original, translated } = props.item;
  const short = original.length + translated.length < 26;
  if (short) {
    return (
      <TouchableHighlight
        style={[
          styles.container,
          {
            opacity: props.loaded ? 1 : NOT_YET_LOADED_OPACITY,
            backgroundColor: props.uploaded ? '#eee' : '#fee'
          }
        ]}
        activeOpacity={1}
        underlayColor="#ddd"
        onPress={() => props.onPress()}
        onLongPress={() => props.onLongPress()}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{original}</Text>
          <FontAwesome
            name="long-arrow-right"
            size={20}
            color="#4af"
            style={{ backgroundColor: 'transparent' }}
          />
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{translated}</Text>
        </View>
      </TouchableHighlight>
    );
  } else {
    return (
      <TouchableHighlight
        style={[
          styles.container,
          {
            opacity: props.loaded ? 1 : NOT_YET_LOADED_OPACITY,
            backgroundColor: props.uploaded ? '#eee' : '#fee'
          }
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
    );
  }
});

const styles = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10
  }
};
