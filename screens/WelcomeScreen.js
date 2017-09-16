import React, { Component } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Button
} from 'react-native';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { getWelcomeScreens } from '../reducers/selectors';

const SCREEN_WIDTH = Dimensions.get('window').width;

const styles = {
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH
  },
  head: {
    fontSize: 40,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20
  },
  body: {
    fontSize: 25,
    color: 'white',
    textAlign: 'center',
    opacity: 0.8
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: SCREEN_WIDTH
  },
  button: {
    paddingLeft: 20,
    paddingRight: 20
  }
};

class WelcomeScreen extends Component {
  renderSlides() {
    return [
      ...this.props.guide.map((slide, index) => {
        return (
          <View
            key={index}
            style={[styles.slide, { backgroundColor: slide.background }]}
          >
            <Text style={styles.head}>{slide.head}</Text>
            <Text style={styles.body}>{slide.body}</Text>
          </View>
        );
      })
    ];
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={{ flex: 1 }}
        >
          {this.renderSlides()}
        </ScrollView>
        <View style={{ ...styles.bottomContainer, flex: 0.1 }}>
          <Button title="Поехали!" onPress={() => this.skipWelcomeScreen()} />
        </View>
      </View>
    );
  }
}

function mapStateToProps(state) {
  return {
    guide: getWelcomeScreens(state)
  };
}

export default connect(mapStateToProps, actions)(WelcomeScreen);
