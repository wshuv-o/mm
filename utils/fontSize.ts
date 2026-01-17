import { Platform, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const BASE_FONT_SIZES = {
  desktop: {
    small: 14,
    
    medium: 15,
    large: 18,
    xlarge: 20,
    xxlarge: 24,
    xxxlarge:40,
  },
  mobile: {
    small: 13,
    
    medium: 15,
    large: 15,
    xlarge: 18,
    xxlarge: 20,
    xxxlarge: 23,
  }
};

// Check if device is desktop (tablet or larger)
const isDesktop = width >= 768;

export const getFontSize = (size: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge') => {
  const deviceType = isDesktop ? 'desktop' : 'mobile';
  return BASE_FONT_SIZES[deviceType][size];
}; 