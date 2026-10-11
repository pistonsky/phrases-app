import React, { memo } from 'react'
import Swipeout from './Swipeout'
import colors from 'app/styles/colors'
import I18n from 'app/utils/i18n'
import ListItemShort from './ListItemShort'

const ListItem = ({ item, loaded, uploaded, onPress, onEdit, onShare, onDelete }) => {
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

export default memo(ListItem)
