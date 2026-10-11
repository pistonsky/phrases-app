// Based on react-native-simple-onboarding by Gosha Arinich (MIT License),
// as forked in https://github.com/pistonsky/react-native-simple-onboarding (v0.1.5).
// Vendored because the fork used string refs, which React 19 no longer supports.
import React, { useRef, useState } from 'react';
import { View, ScrollView, Dimensions } from 'react-native';
import tinycolor from 'tinycolor2';

import PageData from './PageData';
import Paginator from './Paginator';

const Onboarding = ({
  pages,
  bottomOverlay = true,
  showSkip = true,
  showNext = true,
  showDone = true,
  onEnd,
  onLeft,
  leftText = 'Skip',
}) => {
  const [currentPage, setCurrentPage] = useState(0);
  const scroll = useRef<any>(null);

  const updatePosition = (event) => {
    const { contentOffset, layoutMeasurement } = event.nativeEvent;
    const pageFraction = contentOffset.x / layoutMeasurement.width;
    const page = Math.round(pageFraction);
    const isLastPage = pages.length === page + 1;
    if (isLastPage && pageFraction - page > 0.3) {
      onEnd();
    } else {
      setCurrentPage(page);
    }
  };

  const goNext = () => {
    const { width } = Dimensions.get('window');
    const nextPage = currentPage + 1;
    const offsetX = nextPage * width;
    // currentPage follows along through onScroll
    scroll.current.scrollTo({
      x: offsetX,
      animated: true
    });
  };

  const { width, height } = Dimensions.get('window');
  const page = pages[currentPage] || pages[0];
  const { backgroundColor } = page;
  const isLight = tinycolor(backgroundColor).getBrightness() > 180;

  return (
    <View style={{ flex: 1, backgroundColor: backgroundColor, justifyContent: 'center' }}>
      <ScrollView
        ref={scroll}
        pagingEnabled={true}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
        onScroll={updatePosition}
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
        currentPage={currentPage}
        onEnd={onEnd}
        onNext={goNext}
        onLeft={onLeft}
        leftText={leftText}
      />
    </View>
  );
};

export default Onboarding;
