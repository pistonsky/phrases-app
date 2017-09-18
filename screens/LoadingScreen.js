import React, { Component } from 'react';
import { View, Image } from 'react-native';
import store from '../store';
import { ROUTER_READY } from '../actions/types';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2EB2FF'
  },
  image: {
    width: 200,
    height: 200
  }
};

export default class LoaderScreen extends Component {
  componentDidMount() {
    store.dispatch({ type: ROUTER_READY });
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={require('../assets/icons/loading.png')} />
      </View>
    );
  }
}
