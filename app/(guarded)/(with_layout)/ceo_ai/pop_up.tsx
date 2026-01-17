// app\(guarded)\(with_layout)\ceo_ai\pop_up.tsx
'use dom';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  Alert,
  Platform,
  findNodeHandle,
  Animated,
  Easing,
  LayoutChangeEvent,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Defs, LinearGradient as SvgGradient, Stop, Filter, FeTurbulence } from 'react-native-svg';
import { useAuthManager } from '@/hooks/useAuthManager';
import { useFonts } from 'expo-font';
import Wizard from './wizard';
import { API } from '@/api/api';

const AnimatedRect = Animated.createAnimatedComponent(Rect);
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const isMobile = screenWidth < 768;

const GrainOverlay = () => (
  <Svg height="100%" width="100%" style={StyleSheet.absoluteFill}>
    <Defs><Filter id="grain"><FeTurbulence type="fractalNoise" baseFrequency="0.75" /></Filter></Defs>
    <Rect width="100%" height="100%" filter="url(#grain)" opacity="0.06" />
  </Svg>
);

const StaticCornerBlob = () => {
  const BLOB_SIZE = 220;
  const BLOB_RADIUS = BLOB_SIZE / 2;
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
  const onLayout = (event: LayoutChangeEvent) => { const { width, height } = event.nativeEvent.layout; setLayout({ width, height }); };
  if (layout.width === 0) { return <View style={{ flex: 1 }} onLayout={onLayout}>{children}</View>; }
  const perimeter = (layout.width - borderRadius * 2) * 2 + (layout.height - borderRadius * 2) * 2 + (2 * Math.PI * borderRadius);
  const strokeDashoffset = animValue.interpolate({ inputRange: [0, 1], outputRange: [perimeter, 0] });
  return (
    <View style={{ flex: 1 }} onLayout={onLayout}>
      <Svg style={StyleSheet.absoluteFill} width={layout.width} height={layout.height}>
        <Defs><SvgGradient id="grad" x1="0" y1="0" x2="1" y2="0"><Stop offset="0" stopColor="#00EAFF" stopOpacity="1" /><Stop offset="1" stopColor="#8BFFFD" stopOpacity="1" /></SvgGradient></Defs>
        <AnimatedRect x={STROKE_WIDTH / 2} y={STROKE_WIDTH / 2} rx={borderRadius} ry={borderRadius} width={layout.width - STROKE_WIDTH} height={layout.height - STROKE_WIDTH} fill="transparent" stroke="url(#grad)" strokeWidth={STROKE_WIDTH} strokeDasharray={`${COMET_LENGTH} ${perimeter}`} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </Svg>
      {children}
    </View>
  );
};


export default function PopUp({ onClose, wizardId, onWizardComplete, onBack }: { onClose: () => void; wizardId: number; onWizardComplete?: () => void; onBack?: () => void }) {
  const { activeUser } = useAuthManager();
  const userPublicId = activeUser?.publicId;

  const handleWizardComplete = async (answers: Record<number, string>) => {
    if (!userPublicId) { Alert.alert('Error', 'User not authenticated. Please log in.'); return; }
    try {
      const stepsResponse = await fetch(`${API.AI_BASE_URL}/wizard-steps/wizard/${wizardId}`,{headers: API.authHeaders()});
      if (!stepsResponse.ok) throw new Error('Failed to fetch steps');
      const steps: { stepId: number; stepTitle: string; saveToContext: number; contextKey: string | null }[] = await stepsResponse.json();

      for (const step of steps.filter(s => s.saveToContext === 1)) {
        if (answers[step.stepId]) {
          const formattedQuestion = step.contextKey ? `${step.contextKey}` : step.stepTitle;
          await fetch(`${API.AI_BASE_URL}/stored-wizard-data`, {
            method: 'POST',
            headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ wizardId, wizardStepNumber: step.stepId, studentPublicId: userPublicId, question: formattedQuestion, answer: answers[step.stepId] }),
          });
        }
      }
      // The onWizardComplete prop, passed from LeftSidebar, already handles closing the modal and refreshing the data.
      if (onWizardComplete) {
        onWizardComplete();
      }
      // We no longer call onClose directly here, as the parent's onWizardComplete handles it.
    } catch (error) { console.error('Error storing responses:', error); Alert.alert('Error', 'Failed to store responses. Please try again.'); }
  };

  const [fontsLoaded] = useFonts({ 'InterDisplay-Regular': require('@/assets/fonts/InterDisplay-Regular.ttf') });
  if (!fontsLoaded) return null;

  return (
    <Modal transparent visible={true} onRequestClose={onClose} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* <StaticCornerBlob /> */}
          <AnimatedBorder>
            <Wizard
              onComplete={handleWizardComplete}
              wizardId={wizardId}
              onClose={onClose}
              onBack={onBack}
            />
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  modalContainer: {
    width: isMobile ? '95%' : '45%',
    maxWidth: 700,
    maxHeight: '85%',
    borderRadius: 20,
    backgroundColor: 'rgba(28, 30, 32, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  blob: { position: 'absolute', opacity: 0.4 },
  blobGradient: { width: '100%', height: '100%', borderRadius: 9999 },
});