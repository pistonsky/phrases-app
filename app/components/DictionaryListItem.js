import React, { Component } from 'react'
import { View, Text, TextInput, TouchableHighlight, Vibration } from 'react-native'
import Swipeout from 'react-native-swipeout'
import { Icon } from 'react-native-elements'
import colors from 'app/styles/colors'
import { smartFontSize } from 'app/utils/functions'

export default class DictionaryListItem extends Component {
  constructor(props) {
    super(props)
    this.state = { editable: false, text: props.item.name }
  }

  render() {
    const { item, onCopy, onDelete, onPress, onChange, onFocus } = this.props
    const { text, editable } = this.state

    const styles = {
      centeredContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }

    return (
      <Swipeout
        style={{ backgroundColor: 'transparent' }}
        autoClose
        right={[
          {
            component: (
              <View style={styles.centeredContent}>
                <Icon name="ios-copy" type="ionicon" size={24} color={colors.white} />
              </View>
            ),
            onPress: () => onCopy(),
          },
          {
            component: (
              <View style={styles.centeredContent}>
                <Icon name="ios-trash" type="ionicon" size={30} color={colors.white} />
              </View>
            ),
            backgroundColor: '#f00',
            onPress: () => onDelete(),
          },
        ]}
      >
        <TouchableHighlight
          underlayColor="rgba(0, 0, 0, 0.2)"
          activeOpacity={1}
          onPress={() => onPress()}
          onLongPress={() => {
            Vibration.vibrate([200], false)
            this.setState({ editable: true })
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: 10,
              paddingHorizontal: 20,
              height: 40,
              borderBottomWidth: 1,
              borderColor: 'rgba(0, 0, 0, 0.1)',
            }}
          >
            {!editable ? (
              <Text
                style={{
                  color: colors.white,
                  fontSize: smartFontSize({
                    min: 14,
                    max: 18,
                    threshold: 25,
                    text: item.name,
                  }),
                }}
                numberOfLines={2}
              >
                {item.name}
              </Text>
            ) : (
              <TextInput
                style={{
                  backgroundColor: 'transparent',
                  fontSize: smartFontSize({
                    max: 18,
                    min: 14,
                    threshold: 25,
                    text,
                  }),
                  color: '#eee',
                  flex: 1,
                }}
                underlineColorAndroid="transparent"
                selectionColor="#888"
                autoCorrect={false}
                autoFocus
                clearButtonMode="while-editing"
                enablesReturnKeyAutomatically
                value={text}
                onChangeText={newText => {
                  this.setState({ text: newText })
                }}
                onSubmitEditing={() => {
                  onChange(text)
                }}
                onFocus={() => onFocus()}
              />
            )}
            {item.selected && (
              <Icon
                name="ios-checkmark"
                type="ionicon"
                size={30}
                color={colors.white}
                style={{ position: 'relative', top: 2 }}
              />
            )}
          </View>
        </TouchableHighlight>
      </Swipeout>
    )
  }
}
