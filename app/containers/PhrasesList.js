import React from 'react'
import { connect } from 'react-redux'
import { View, Text, FlatList, ActivityIndicator, ActionSheetIOS } from 'react-native'
import { Button } from 'react-native-elements'
import { ListItem, Separator, OfflineBar } from 'app/components'
import {
  getData,
  getUserId,
  getDataLoading,
  getOffline,
  getAudioCache,
  getCurrentDictionaryName,
} from 'app/reducers/selectors'
import styles from 'app/styles'
import { store } from 'app/redux'
import colors from 'app/styles/colors'
import {
  PLAY_PHRASE,
  OPEN_ADD_NEW_MODAL,
  SHARE_PHRASE,
  SHARE_ALL_PHRASES,
  SHARE_DICTIONARY,
  OPEN_PHRASE,
} from 'app/actions/types'
import * as actions from 'app/actions'

const PhrasesList = props => {
  const { user_id, cache, data, dictionary, data_loading, offline, deletePhrase, refreshPhrases } = props
  return (
    <View style={styles.flatlist}>
      <FlatList
        key={dictionary}
        style={styles.flatlist}
        contentContainerStyle={styles.flatlistContent}
        data={data}
        keyExtractor={item => {
          return item.uri ? item.uri : item.original
        }}
        renderItem={({ item }) => (
          <ListItem
            key={item.uri + item.original}
            item={item}
            loaded={item.uri in cache}
            uploaded={item.synced === undefined ? true : item.synced}
            onPress={_item => store.dispatch({ type: PLAY_PHRASE, phrase: _item })}
            onDelete={_item => deletePhrase(_item)}
            onShare={_item => store.dispatch({ type: SHARE_PHRASE, phrase: _item })}
            onEdit={_item => store.dispatch({ type: OPEN_PHRASE, phrase: _item })}
          />
        )}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={(
          <View
            style={styles.flatlistEmpty}
            onTouchStart={() => {
              store.dispatch({ type: OPEN_ADD_NEW_MODAL })
            }}
          >
            {data_loading && <ActivityIndicator size="small" color="#ffffff" />}
            <Text style={styles.flatlistPlaceholder}>{data_loading ? 'Loading...' : 'Add your first phrazee!'}</Text>
          </View>
        )}
        refreshing={data_loading}
        onRefresh={() => refreshPhrases(user_id)}
        initialNumToRender={15}
      />
      <View style={styles.shareButtonContainer}>
        <Button
          iconRight
          icon={{ name: 'share-apple', type: 'evilicon', size: 25 }}
          title="SHARE THIS DICTIONARY"
          backgroundColor={colors.secondary}
          onPress={() => store.dispatch({ type: SHARE_DICTIONARY })}
          onLongPress={() => {
            ActionSheetIOS.showActionSheetWithOptions(
              { options: ['Share This Dictionary', 'Share All Phrazes', 'Cancel'], cancelButtonIndex: 2 },
              i => i < 2 && store.dispatch({ type: [SHARE_DICTIONARY, SHARE_ALL_PHRASES][i] }),
            )
          }}
        />
        {offline && <OfflineBar />}
      </View>
    </View>
  )
}

function mapStateToProps(state) {
  return {
    data: getData(state),
    data_loading: getDataLoading(state),
    user_id: getUserId(state),
    offline: getOffline(state),
    cache: getAudioCache(state),
    dictionary: getCurrentDictionaryName(state),
  }
}

export default connect(
  mapStateToProps,
  actions,
)(PhrasesList)
