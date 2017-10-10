import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Button } from 'react-native';
import { DictionarySelector } from '../containers';
import styles from '../styles';
import colors from '../styles/colors';
import { OPEN_ADD_NEW_MODAL, PLAY_ALL } from '../actions/types';
import store from '../store';
import { getData } from '../reducers/selectors';

class NavBar extends Component {
  render() {
    return (
      <View style={styles.navBarStyle}>
        <View style={{ opacity: this.props.data.length ? 1 : 0 }}>
          <Button
            onPress={() => store.dispatch({ type: PLAY_ALL })}
            title="Play All"
            color={colors.primary}
          />
        </View>
        <DictionarySelector />
        <Button
          onPress={() => store.dispatch({ type: OPEN_ADD_NEW_MODAL })}
          title="Add"
          color={colors.primary}
        />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    data: getData(state)
  };
}

export default connect(mapStateToProps)(NavBar);
