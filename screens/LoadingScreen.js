import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Image } from 'react-native';
import { Actions } from 'react-native-router-flux';
import { getUserId } from '../reducers/selectors';

const styles = {
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2EB2FF'
  },
  image: {
    width: 100,
    height: 100
  }
};

class LoaderScreen extends Component {
  componentWillMount() {
    if (this.props.userId) {
      Actions.main();
    } else {
      Actions.welcome();
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Image style={styles.image} source={require('../assets/icons/loading.png')} />
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    userId: getUserId(state)
  }
}

export default connect(mapStateToProps)(LoaderScreen);
