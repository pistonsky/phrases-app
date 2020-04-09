import React, { Component } from 'react'
import { View, Image, Dimensions } from 'react-native'
import Onboarding from 'react-native-simple-onboarding'
import { connect } from 'react-redux'
import { ConnectFacebookModal } from 'app/containers'
import * as actions from 'app/actions'
import { getWelcomeScreens } from 'app/reducers/selectors'

class WelcomeScreen extends Component {
  renderSlides() {
    const { guide } = this.props
    // iPhone 6 Plus = 414
    // iPhone 6      = 375
    // iPhone SE     = 320
    const SCREEN_WIDTH = Dimensions.get('window').width
    const size = (SCREEN_WIDTH / 320) * 200
    return [
      ...guide.map((slide, index) => {
        return {
          backgroundColor: slide.background,
          image: (
            <Image
              style={{ width: size, height: size }}
              source={
                [require('assets/guide_1.png'), require('assets/guide_2.png'), require('assets/guide_3.png')][
                  index
                ]
              }
            />
          ),
          title: slide.head,
          subtitle: slide.body,
        }
      }),
    ]
  }

  render() {
    const { skipWelcomeScreen, loginWithFacebook } = this.props
    return (
      <View style={{ flex: 1 }}>
        <ConnectFacebookModal />
        <Onboarding
          pages={this.renderSlides()}
          onEnd={() => skipWelcomeScreen()}
          onLeft={() => loginWithFacebook()}
          leftText="Login"
        />
      </View>
    )
  }
}

function mapStateToProps(state) {
  return {
    guide: getWelcomeScreens(state),
  }
}

export default connect(
  mapStateToProps,
  actions,
)(WelcomeScreen)
