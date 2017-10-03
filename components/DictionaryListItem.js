import React, { Component } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableHighlight,
  Vibration
} from 'react-native';
import Swipeout from 'react-native-swipeout';
import { Icon } from 'react-native-elements';
import colors from '../styles/colors';
import { smartFontSize } from '../utils/functions';

export default class DictionaryListItem extends Component {
  constructor(props) {
    super(props);
    this.state = { editable: false, text: this.props.item.name };
  }

  render() {
    const { item } = this.props;

    return (
      <Swipeout
        style={{ backgroundColor: 'transparent' }}
        autoClose
        right={[
          {
            text: 'Delete',
            backgroundColor: '#f00',
            onPress: () => this.props.onDelete()
          }
        ]}
      >
        <TouchableHighlight
          underlayColor="rgba(0, 0, 0, 0.2)"
          activeOpacity={1}
          onPress={() => this.props.onPress()}
          onLongPress={() => {
            Vibration.vibrate([200], false);
            this.setState({ editable: true });
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
              borderColor: 'rgba(0, 0, 0, 0.1)'
            }}
          >
            {!this.state.editable ? (
              <Text
                style={{
                  color: colors.white,
                  fontSize: smartFontSize({
                    min: 14,
                    max: 18,
                    threshold: 25,
                    text: item.name
                  })
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
                    text: this.state.text
                  }),
                  color: '#eee',
                  flex: 1
                }}
                underlineColorAndroid="transparent"
                selectionColor="#888"
                autoCorrect={false}
                autoFocus={true}
                clearButtonMode="while-editing"
                enablesReturnKeyAutomatically={true}
                value={this.state.text}
                onChangeText={text => {
                  this.setState({ text });
                }}
                onSubmitEditing={() => {
                  this.props.onChange(this.state.text);
                }}
                onFocus={() => this.props.onFocus()}
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
    );
  }
}
