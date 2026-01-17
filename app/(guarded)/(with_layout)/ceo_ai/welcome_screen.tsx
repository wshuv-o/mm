// G:\finishing\ceo_ai_frontend\app\(guarded)\(with_layout)\ceo_ai\welcome_screen.tsx
'use dom';

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
  LayoutChangeEvent,
  Animated,
  Easing,
  ImageBackground,
} from 'react-native';
import Svg, { Rect, Defs, LinearGradient as SvgGradient, Stop, Filter, FeTurbulence } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { moderateScale } from 'react-native-size-matters';
import CustomIcon from '@/components/custom_icon/CustomIcon';

const { width: screenWidth } = Dimensions.get('window');
const isMobile = screenWidth < 768;
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const buttonBgImage = require('./download (13).jpeg'); // Ensure this path is correct

// --- UI Helper Components for Professional Glassmorphism ---
const GrainOverlay = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
    <Defs><Filter id="grain"><FeTurbulence type="fractalNoise" baseFrequency="0.75" /></Filter></Defs>
    <Rect width="100%" height="100%" filter="url(#grain)" opacity="0.06" />
  </Svg>
);

const StaticCornerBlob = () => {
  const BLOB_SIZE = 220; const BLOB_RADIUS = BLOB_SIZE / 2;
  return (
    <View style={[styles.blob, { width: BLOB_SIZE, height: BLOB_SIZE, top: -BLOB_RADIUS, left: -BLOB_RADIUS }]}>
      <LinearGradient colors={['#00FFFF', '#007BFF']} style={styles.blobGradient} />
      <GrainOverlay />
    </View>
  );
};

const AnimatedBorder = ({ children }: { children: React.ReactNode }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const animValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const STROKE_WIDTH = 1.5; const COMET_LENGTH = 70; const borderRadius = 20;

  useEffect(() => {
    if (layout.width > 0 && !animationRef.current) {
      animationRef.current = Animated.loop(Animated.timing(animValue, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }));
      animationRef.current.start();
    }
    return () => { animationRef.current?.stop(); animationRef.current = null; };
  }, [layout.width, animValue]);

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setLayout({ width, height });
  };

  if (layout.width === 0) {
    return <View style={{ flex: 1 }} onLayout={onLayout}>{children}</View>;
  }

  const perimeter = (layout.width - borderRadius * 2) * 2 + (layout.height - borderRadius * 2) * 2 + (2 * Math.PI * borderRadius);
  const strokeDashoffset = animValue.interpolate({ inputRange: [0, 1], outputRange: [perimeter, 0] });

  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <Svg style={StyleSheet.absoluteFill} width={layout.width} height={layout.height}>
        <Defs>
          <SvgGradient id="welcomeGrad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#00EAFF" stopOpacity="1" />
            <Stop offset="1" stopColor="#8BFFFD" stopOpacity="1" />
          </SvgGradient>
        </Defs>
        <AnimatedRect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} rx={borderRadius} ry={borderRadius} width={layout.width - STROKE_WIDTH} height={layout.height - STROKE_WIDTH} fill="transparent" stroke="url(#welcomeGrad)" strokeWidth={STROKE_WIDTH} strokeDasharray={`${COMET_LENGTH} ${perimeter}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </Svg>
      {children}
    </View>
  );
};


// --- Main Component ---
interface WelcomeScreenProps {
  onClose: () => void;
  onNext: () => void;
  onSkip: () => void;
  courseId: string;
}

export default function WelcomeScreen({ onClose, onNext, onSkip, courseId }: WelcomeScreenProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return (
    <Modal transparent visible={true} onRequestClose={onClose} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* <StaticCornerBlob /> */}
          <AnimatedBorder>
            <>
              <View style={styles.header}>
                <CustomIcon name="globe" size={24} color="#00EAFF" />
                <Text style={styles.headerTitle}>CEO AI</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <CustomIcon name="close" size={28} color="#999" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                 <View style={styles.iconContainer}>
                    <CustomIcon name="focus" size={isMobile ? 50 : 64} color="rgba(0, 234, 255, 0.8)" />
                </View>
                <Text style={styles.welcomeText}>
                 Let AI help you with your objective or set it manually
                </Text>
              </View>

              <View style={styles.footer}>
                <View style={styles.mainActions}>
                    <TouchableOpacity className="action-button" onPress={onSkip} style={styles.backButton}>
                        <Text style={styles.backButtonText}>SET MANUALLY</Text>
                    </TouchableOpacity>
                    <TouchableOpacity className="action-button" onPress={onNext}>
                        <ImageBackground source={buttonBgImage} style={styles.nextButton} imageStyle={{ borderRadius: styles.nextButton.borderRadius, opacity: imageLoaded ? 1 : 0 }} onLoad={() => setImageLoaded(false)}>
                            <Text style={styles.nextButtonText}>USE AI WIZARD</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
              </View>
            </>
          </AnimatedBorder>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 10, 15, 0.85)', // Reliable dark overlay
  },
  modalContainer: {
    width: isMobile ? '90%' : '35%',
    maxWidth: 500,
    maxHeight: '75%',
    aspectRatio: 1 / 1.2,
    borderRadius: 20,
    backgroundColor: 'rgba(28, 30, 32, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    boxShadow: '0 16px 40px 0 rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  blob: { position: 'absolute', opacity: 0.35 },
  blobGradient: { width: '100%', height: '100%', borderRadius: 9999 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: moderateScale(14),
    fontFamily: 'InterDisplay-SemiBold',
    marginLeft: 12,
    flex: 1,
  },
  closeButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: 'rgba(0, 234, 255, 0.05)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0, 234, 255, 0.1)',
  },
  welcomeText: {
    color: '#E0E0E0',
    fontSize: moderateScale(16, 0.2),
    textAlign: 'center',
    lineHeight: moderateScale(26, 0.2),
    fontFamily: 'InterDisplay-Regular',
    paddingHorizontal: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  mainActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  // --- MODIFIED: Responsive button styles ---
  backButton: {
    paddingVertical: isMobile ? 12 : 14,
    paddingHorizontal: isMobile ? 15 : 20,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
    fontFamily: 'InterDisplay-SemiBold',
    letterSpacing: 1,
  },
  nextButton: {
    paddingVertical: isMobile ? 13 : 15,
    paddingHorizontal: isMobile ? 18 : 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00EAFF',
    overflow: 'hidden',
  },
  nextButtonText: {
    color: '#000000',
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
    fontFamily: 'InterDisplay-SemiBold',
    letterSpacing: 1,
  },
});