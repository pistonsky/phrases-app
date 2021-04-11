import React, { PureComponent } from 'react'
import Swipeout from 'react-native-swipeout'
import colors from 'app/styles/colors'
import I18n from 'app/utils/i18n'
import ListItemShort from './ListItemShort'

export default class ListItem extends PureComponent {
  render() {
    const { item, loaded, uploaded, onPress, onEdit, onShare, onDelete } = this.props

    return (
      <Swipeout
        autoClose
        right={[
          {
            text: I18n.t('Edit'),
            backgroundColor: colors.secondary_dark,
            onPress: () => onEdit(item),
          },
          {
            text: I18n.t('Share'),
            backgroundColor: colors.primary_dark,
            onPress: () => onShare(item),
          },
          {
            text: I18n.t('Delete'),
            backgroundColor: '#f00',
            onPress: () => onDelete(item),
          },
        ]}
      >
        <ListItemShort
          item={item}
          loaded={loaded}
          uploaded={uploaded}
          onPress={() => onPress(item)}
          onLongPress={() => onEdit(item)}
        />
      </Swipeout>
    )
  }
}
