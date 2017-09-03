import React, { PureComponent } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';

export default class ListItem extends PureComponent {
  render() {
    const { original, translated, recording, uri } = this.props.item;

    return (
      <TouchableHighlight
        style={styles.container}
        activeOpacity={1}
        underlayColor="#ddd"
        onPress={() => this.props.onPress(this.props.item)}
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
  }
}

const styles = {
  container: {
    flex: 1,
    justifyContent: 'space-between',
    backgroundColor: '#eee',
    padding: 10
  }
};
