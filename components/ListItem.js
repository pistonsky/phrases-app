import React, { PureComponent } from 'react';
import Swipeout from 'react-native-swipeout';
import { FontAwesome } from '@expo/vector-icons';
import colors from '../styles/colors';
import ListItemShort from './ListItemShort';

export default class ListItem extends PureComponent {
  render() {
    const { original, translated, recording, uri } = this.props.item;

    return (
      <Swipeout
        autoClose
        right={[
          {
            text: 'Edit',
            backgroundColor: colors.secondary_dark,
            onPress: () => this.props.onEdit(this.props.item)
          },
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
        <ListItemShort
          item={this.props.item}
          loaded={this.props.loaded}
          uploaded={this.props.uploaded}
          onPress={() => this.props.onPress(this.props.item)}
          onLongPress={() => this.props.onEdit(this.props.item)}
        />
      </Swipeout>
    );
  }
}
