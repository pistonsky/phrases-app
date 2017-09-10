import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  Modal,
  FlatList
} from 'react-native';
import { Button } from 'react-native-elements';
import { Permissions, Audio, Asset } from 'expo';
import { ListItem, Separator, Item, AddNewForm } from '../components';
import { getData, getAddNewModalShown } from '../reducers/selectors';
import store from '../store';
import {
  OPEN_ADD_NEW_MODAL,
  CLOSE_ADD_NEW_MODAL,
  RECORDING_PERMISSIONS_GRANTED,
  RECORDING_PERMISSIONS_DENIED,
  DELETE_PHRASE
} from '../actions/types';
import * as config from '../utils/config';

class MainScreen extends Component {
  static navigationOptions = ({ navigation }) => ({
    title: `Phrases`,
    back: false
  });

  componentDidMount() {
    this._askForPermissions();
  }

  _askForPermissions = async () => {
    const { status } = await Permissions.askAsync(Permissions.AUDIO_RECORDING);
    if (status === 'granted') {
      store.dispatch({ type: RECORDING_PERMISSIONS_GRANTED });
    } else {
      store.dispatch({ type: RECORDING_PERMISSIONS_DENIED });
    }
  };

  render() {
    return (
      <View style={styles.container}>
        <Modal
          animationType="slide"
          transparent={false}
          visible={this.props.add_new_modal_shown}
          onRequestClose={() => {
            store.dispatch({ type: CLOSE_ADD_NEW_MODAL });
          }}
        >
          <AddNewForm />
        </Modal>
        <StatusBar barStyle="dark-content" translucent={true} />
        <FlatList
          style={{ width: '100%', flex: 1 }}
          data={this.props.data}
          keyExtractor={item => {
            console.log(item);
            return item.uri;
          }}
          renderItem={({ item }) => (
            <ListItem
              key={item.uri}
              item={item}
              onPress={async item => {
                // const uri = config.BASE_URL + '/phrase/' + item.uri;
                // await Audio.setIsEnabledAsync(true);
                // const sound = new Audio.Sound();
                // await sound.loadAsync({ uri });
                // await sound.playAsync();

                console.log(item.localUri);

                const {
                  soundObject,
                  status
                } = await Audio.Sound.create(
                  { uri: item.localUri },
                  { shouldPlay: true }
                );
              }}
              onDelete={item => store.dispatch({ type: DELETE_PHRASE, payload: item })}
            />
          )}
          ItemSeparatorComponent={Separator}
          ListEmptyComponent={
            <View
              style={{
                height: 500,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={styles.placeholder}>Add your first phrase!</Text>
            </View>
          }
        />
      </View>
    );
  }
}

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  modal: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4af'
  },
  placeholder: {
    color: '#888'
  }
};

function mapStateToProps(state) {
  return {
    data: getData(state),
    add_new_modal_shown: getAddNewModalShown(state)
  };
}

export default connect(mapStateToProps)(MainScreen);
