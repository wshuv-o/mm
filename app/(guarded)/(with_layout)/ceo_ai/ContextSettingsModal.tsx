'use dom';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Platform,
  findNodeHandle,
  Animated,
  Easing,
  LayoutChangeEvent,
  ScrollViewProps,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Rect, Defs, LinearGradient as SvgGradient, Stop, Filter, FeTurbulence } from 'react-native-svg';
import { useAuthManager } from '@/hooks/useAuthManager';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { API } from '@/api/api';

const buttonBgImage = require('./download (13).jpeg');

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

const AnimatedBorder = ({ children, borderRadius }: { children: React.ReactNode, borderRadius: number }) => {
  const [layout, setLayout] = useState({ width: 0, height: 0 });
  const animValue = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);
  const STROKE_WIDTH = 1.5; const COMET_LENGTH = 70;
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

const CustomScrollView = (props: ScrollViewProps) => {
  const ref = useRef<ScrollView>(null);
  useEffect(() => {
    if (Platform.OS === 'web' && ref.current) {
      const node = findNodeHandle(ref.current);
      if (node) { (node as HTMLElement).classList.add('custom-scrollbar'); }
    }
  }, []);
  return <ScrollView {...props} ref={ref} />;
};

if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    .input-wrapper:focus-within { border-color: #00EAFF; box-shadow: 0 0 10px 0px rgba(0, 234, 255, 0.5); }
    .save-button-container:hover { box-shadow: 0 0 20px 0px rgba(0, 234, 255, 0.6); }
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #00EAFF; border-radius: 4px; border: 2px solid rgba(0, 0, 0, 0.2); background-clip: padding-box; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8BFFFD; }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #20ABC9 rgba(0, 0, 0, 0.2); }
  `;
  document.head.append(style);
}

interface ContextItem { wizardId: number; stepId: number; questionToSave: string; displayLabel: string; value: string; }
interface Wizard { wizardId: number; coursePublicId: string; }
interface WizardStep { stepId: number; stepTitle: string; saveToContext: number; contextKey: string | null; }
interface StoredData { question: string; answer: string; coursePublicId: string | null; }

export default function ContextSettingsModal({ onClose, courseId, onDataUpdated }: { onClose: () => void; courseId: string; onDataUpdated: () => void; }) {
  const { activeUser } = useAuthManager();
  const userPublicId = activeUser?.publicId;
  const [contextItems, setContextItems] = useState<ContextItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const fetchData = useCallback(async () => {
    if (!userPublicId || !courseId) { setError('User or Course information is missing.'); setLoading(false); return; }
    try {
      setLoading(true); setError(null);
      const wizardsRes = await fetch(`${API.AI_BASE_URL}/courses/${courseId}/wizards`, { headers: API.authHeaders() });
      if (!wizardsRes.ok) throw new Error('Failed to fetch wizards for the course.');
      const wizards: Wizard[] = await wizardsRes.json();
      const stepPromises = wizards.map(wizard => fetch(`${API.AI_BASE_URL}/wizard-steps/wizard/${wizard.wizardId}`, { headers: API.authHeaders() }).then(res => res.ok ? res.json() : Promise.reject(`Failed to fetch steps for wizard ${wizard.wizardId}`)).then((steps: WizardStep[]) => steps.filter(step => step.saveToContext === 1).map(step => ({ ...step, wizardId: wizard.wizardId }))));
      const allContextSteps = (await Promise.all(stepPromises)).flat();
      const storedDataRes = await fetch(`${API.AI_BASE_URL}/stored-wizard-data/by-student/${userPublicId}`, { headers: API.authHeaders() });
      if (!storedDataRes.ok) throw new Error(`Failed to fetch student data. Status: ${storedDataRes.status}`);
      const allStoredData: StoredData[] = await storedDataRes.json();
      const relevantStoredData = allStoredData.filter(d => d.coursePublicId === courseId || d.coursePublicId === null);
      const combinedItems: ContextItem[] = allContextSteps.map(step => {
        const questionToSave = step.contextKey ? `${step.contextKey}` : step.stepTitle;
        // const displayLabel = step.contextKey ? step.contextKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : step.stepTitle;
        
        const keyToTitle = (str: string) =>str.replace(/_/g, ' ')
              .split(' ')
              .map(word =>
                word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(' ');

        const displayLabel = step.contextKey
          ? keyToTitle(step.contextKey)
          : step.stepTitle;


        const existingAnswer = relevantStoredData.find(data => data.question === questionToSave);
        return { wizardId: step.wizardId, stepId: step.stepId, questionToSave: questionToSave, displayLabel: displayLabel, value: existingAnswer?.answer || '' };
      });
      const uniqueItems = Array.from(new Map(combinedItems.map(item => [item.questionToSave, item])).values());
      setContextItems(uniqueItems);
    } catch (e: any) { console.error("Error fetching context data:", e); setError(e.message || 'An unknown error occurred.'); } finally { setLoading(false); }
  }, [userPublicId, courseId]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleInputChange = (text: string, index: number) => { const newItems = [...contextItems]; newItems[index].value = text; setContextItems(newItems); };

  const handleSaveChanges = async () => {
    if (!userPublicId) { Alert.alert('Error', 'User not authenticated.'); return; }
    setSaving(true);
    try {
      const savePromises = contextItems.map(item => { if (item.value) { return fetch(`${API.AI_BASE_URL}/stored-wizard-data`, { method: 'POST', headers: { ...API.authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ wizardId: item.wizardId, wizardStepNumber: item.stepId, studentPublicId: userPublicId, question: item.questionToSave, answer: item.value }) }); } return Promise.resolve(); });

      await Promise.all(savePromises);

      Alert.alert('Success', 'Your settings have been updated.');

      // Call the callback function passed from LeftSidebar.
      // This will close the modal AND trigger the data refresh.
      onDataUpdated();

    } catch (error) { console.error('Error saving context data:', error); Alert.alert('Error', 'Failed to save settings. Please try again.'); } finally { setSaving(false); }
  };

  return (
    <Modal transparent visible={true} onRequestClose={onClose} animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* <StaticCornerBlob /> */}
          <AnimatedBorder borderRadius={styles.modalContainer.borderRadius}>
            <>
              <View style={styles.header}>
                <CustomIcon name="setting" size={24} color="#00EAFF" />
                <Text style={styles.headerTitle}>Context Settings</Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <CustomIcon name="close" size={28} color="#999" />
                </TouchableOpacity>
              </View>
              <CustomScrollView contentContainerStyle={styles.scrollContent}>
                {loading ? (<ActivityIndicator size="large" color="#00EAFF" style={{ marginTop: 50 }} />)
                  : error ? (<Text style={styles.errorText}>{error}</Text>)
                    : contextItems.length === 0 ? (<Text style={styles.errorText}>No configurable context items found.</Text>)
                      : (
                        contextItems.map((item, index) => (
                          <View key={item.questionToSave} style={styles.inputRow}>
                            <Text style={styles.label}>{item.displayLabel}</Text>
                            <View className="input-wrapper" style={styles.inputWrapper}>
                              <TextInput style={styles.input} value={item.value} onChangeText={(text) => handleInputChange(text, index)} placeholder="Not set" placeholderTextColor="#666" />
                            </View>
                          </View>
                        ))
                      )}
              </CustomScrollView>
              {!loading && !error && contextItems.length > 0 && (
                <View style={styles.footer}>
                  <TouchableOpacity
                    className="save-button-container"
                    onPress={handleSaveChanges}
                    disabled={saving}
                  >
                     <View
                      // source={buttonBgImage}
                      style={styles.saveButton}
                      // imageStyle={{ 
                      //   borderRadius: styles.saveButton.borderRadius,
                      //   opacity: imageLoaded ? 1 : 0 
                      // }}
                      // onLoad={() => setImageLoaded(true)}
                      // onError={() => console.error("Failed to load button background image.")}
                    >
                      <Text style={styles.saveButtonText}>
                        {saving ? 'SAVING...' : 'SAVE CHANGES'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              )}
            </>
          </AnimatedBorder>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  blob: { position: 'absolute', opacity: 0.4 },
  blobGradient: { width: '100%', height: '100%', borderRadius: 9999 },
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.3)',
    // @ts-ignore
    backdropFilter: 'blur(16px)',
  },
  modalContainer: {
    width: isMobile ? '95%' : '40%',
    maxWidth: 600, maxHeight: '85%',
    borderRadius: 20,
    backgroundColor: 'rgba(28, 30, 32, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row', alignItems: 'center', padding: 20,
    borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    flexShrink: 0,
    backgroundColor: 'transparent',
  },
  headerTitle: { color: '#FFFFFF', fontSize: 20, fontFamily: 'InterDisplay-SemiBold', marginLeft: 12, flex: 1 },
  closeButton: { padding: 5 },
  scrollContent: { paddingTop: 15, paddingBottom: 25, paddingHorizontal: 25 },
  inputRow: { marginBottom: 25 },
  label: { color: '#CCCCCC', fontSize: 14, fontFamily: 'Inter-Medium', marginBottom: 8, paddingLeft: 4 },
  inputWrapper: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)',
    // @ts-ignore
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
  },
  input: {
    color: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, fontFamily: 'InterDisplay-Regular', borderWidth: 0, backgroundColor: 'transparent',
    // @ts-ignore
    outlineStyle: 'none',
  },
  errorText: { color: '#FF8888', textAlign: 'center', marginTop: 50, fontSize: 16, fontFamily: 'Inter-Medium' },
  footer: {
    padding: 20, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)',
    backgroundColor: 'transparent',
  },
  saveButton: {
    paddingVertical: isMobile ? 13 : 15,
    paddingHorizontal: isMobile ? 18 : 25,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00EAFF',
    overflow: 'hidden',
  },
  saveButtonText: {
    color: '#000000',
    fontSize: isMobile ? 12 : 14,
    fontWeight: 'bold',
    fontFamily: 'InterDisplay-SemiBold',
    letterSpacing: 1,
  },
});