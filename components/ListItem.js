import React, { PureComponent } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';

export default class ListItem extends PureComponent {
  render() {
    return (
      <TouchableHighlight
        style={styles.container}
        activeOpacity={1}
        underlayColor="#ddd"
        onPress={this.props.onPress}
      >
        <View>
          <Text>{this.props.item}</Text>
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
