// Based on react-native-simple-onboarding by Gosha Arinich (MIT License),
// as forked in https://github.com/pistonsky/react-native-simple-onboarding (v0.1.5).
// Vendored because the fork used string refs, which React 19 no longer supports.
import React, { Component, createRef } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import tinycolor from 'tinycolor2';

import PageData from './PageData';
import Paginator from './Paginator';

export default class Onboarding extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentPage: 0,
    };
    this.scroll = createRef();
  }

  updatePosition = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const pageFraction = contentOffset.x / layoutMeasurement.width;
    const page = Math.round(pageFraction);
    const isLastPage = this.props.pages.length === page + 1;
    if (isLastPage && pageFraction - page > 0.3) {
      this.props.onEnd();
    } else {
      this.setState({ currentPage: page });
    }
  };

  goNext = () => {
    const { width } = Dimensions.get('window');
    const { currentPage } = this.state;
    const nextPage = currentPage + 1;
    const offsetX = nextPage * width;
    // currentPage follows along through onScroll
    this.scroll.current.scrollTo({
      x: offsetX,
      animated: true
    });
  };

  render() {
    const { width, height } = Dimensions.get('window');
    const { pages, bottomOverlay, showSkip, showNext, showDone } = this.props;
    const currentPage = pages[this.state.currentPage] || pages[0];
    const { backgroundColor } = currentPage;
    const isLight = tinycolor(backgroundColor).getBrightness() > 180;

    return (
      <View style={{ flex: 1, backgroundColor: backgroundColor, justifyContent: 'center' }}>
        <ScrollView
          ref={this.scroll}
          pagingEnabled={true}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          onScroll={this.updatePosition}
          scrollEventThrottle={100}
        >
          {pages.map(({ image, title, subtitle, titleStyles, subtitleStyles }, idx) => (
            <PageData
              key={idx}
              isLight={isLight}
              image={image}
              title={title}
              subtitle={subtitle}
              titleStyles={titleStyles}
              subtitleStyles={subtitleStyles}
              width={width}
              height={height}
            />
          ))}
        </ScrollView>
        <Paginator
          isLight={isLight}
          overlay={bottomOverlay}
          showSkip={showSkip}
          showNext={showNext}
          showDone={showDone}
          pages={pages.length}
          currentPage={this.state.currentPage}
          onEnd={this.props.onEnd}
          onNext={this.goNext}
          onLeft={this.props.onLeft}
          leftText={this.props.leftText}
        />
      </View>
    );
  }
}

Onboarding.defaultProps = {
  bottomOverlay: true,
  showSkip: true,
  showNext: true,
  showDone: true,
  leftText: 'Skip',
};
