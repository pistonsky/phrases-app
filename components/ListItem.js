import React, { PureComponent } from 'react';
import { View, Text, TouchableHighlight } from 'react-native';
import Swipeout from 'react-native-swipeout';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../styles/colors';

export default class ListItem extends PureComponent {
  render() {
    const { original, translated, recording, uri, localUri } = this.props.item;

    let short = (original.length + translated.length) < 30;

    return (
      <Swipeout
        key={localUri}
        autoClose
        right={[
          {
            text: 'Share',
            backgroundColor: colors.primary_dark,
            onPress: () => this.props.onShare(this.props.item)
          },
          {
            text: 'Delete',
            backgroundColor: '#f00',
            onPress: () => this.props.onDelete(this.props.item)
          }
        ]}
      >
        {short
          ? <TouchableHighlight
              style={[styles.container, { opacity: this.props.loaded ? 1 : 0.1 }]}
              activeOpacity={1}
              underlayColor="#ddd"
              onPress={() => this.props.onPress(this.props.item)}
            >
              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between' }}
              >
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{original}</Text>
                <FontAwesome
                  name="long-arrow-right"
                  size={20}
                  color="#4af"
                  style={{ backgroundColor: 'transparent' }}
                />
                <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
                  {translated}
                </Text>
              </View>
            </TouchableHighlight>
          : <TouchableHighlight
              style={[styles.container, { opacity: this.props.loaded ? 1 : 0.1 }]}
              activeOpacity={1}
              underlayColor="#ddd"
              onPress={() => this.props.onPress(this.props.item)}
            >
              <View
                style={{ flexDirection: 'column', justifyContent: 'flex-start' }}
              >
                <Text
                  style={{ fontSize: 20, fontWeight: 'bold' }}
                  numberOfLines={1}
                >
                  {original}
                </Text>
                <Text style={{ fontSize: 15, color: '#444' }} numberOfLines={1}>
                  {translated}
                </Text>
              </View>
            </TouchableHighlight>}
      </Swipeout>
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
