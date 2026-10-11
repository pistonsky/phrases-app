import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const RATIO = SCREEN_HEIGHT / SCREEN_WIDTH;

const a = (small, regular, big, X, XMax) => {
  switch (true) {
    case SCREEN_HEIGHT === 896 || SCREEN_HEIGHT === 926:
      return XMax !== undefined ? XMax : big !== undefined ? big : regular;
    case SCREEN_HEIGHT === 812 || SCREEN_HEIGHT === 844:
      return X !== undefined ? X : regular;
    case SCREEN_WIDTH <= 360 || RATIO < 1.66:
      return small;
    case SCREEN_WIDTH < 414:
      return regular;
    default:
      return big !== undefined ? big : regular;
  }
}

export default a;
