import React, { Component } from 'react';
import { View, Image } from 'react-native';
import Onboarding from 'react-native-app-onboarding';
import { connect } from 'react-redux';
import * as actions from '../actions';
import { getWelcomeScreens } from '../reducers/selectors';

class WelcomeScreen extends Component {
  renderSlides() {
    return [
      ...this.props.guide.map((slide, index) => {
        return {
          backgroundColor: slide.background,
          image: (
            <Image
              style={{ width: 200, height: 200 }}
              source={
                [
                  require('../assets/guide_1.png'),
                  require('../assets/guide_2.png'),
                  require('../assets/guide_3.png')
                ][index]
              }
            />
          ),
          title: slide.head,
          subtitle: slide.body
        };
      })
    ];
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <Onboarding
          pages={this.renderSlides()}
          onEnd={() => this.props.skipWelcomeScreen()}
        />
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
