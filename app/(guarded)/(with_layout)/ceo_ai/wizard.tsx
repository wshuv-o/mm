'use dom';

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
  findNodeHandle,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import { getStepOptions } from '@/api/stepOptions';
import { getStepDisplay } from '@/api/stepDisplay';
import Markdown from 'react-native-markdown-display';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { API } from '@/api/api';

const buttonBgImage = require('./download (13).jpeg'); // Make sure this path is correct

// --- Wizard Interfaces ---
interface WizardStep { stepId: number; wizardId: number; stepNumber: number; stepTitle: string; promptTemplate: string | null; inputs: string | null; type: number; displayText: string | null; saveToContext: number; contextKey: string | null; marksCompletion: number; unlocksModules: string | null; createdAt: string; updatedAt: string; }
interface StepOption { label: string; value: string; }
interface WizardProps { onComplete: (answers: Record<number, string>) => void; wizardId: number; onClose: () => void; onBack?: () => void; }
interface AnswerHistory { stepId: number; title: string; selectedOption: string; }

// --- Web-only Styles for Scrollbar & Focus ---
if (Platform.OS === 'web') {
  const style = document.createElement('style');
  style.textContent = `
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0, 0, 0, 0.2); }
    .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #00EAFF; border-radius: 4px; border: 2px solid rgba(0, 0, 0, 0.2); background-clip: padding-box; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: #8BFFFD; }
    .custom-scrollbar { scrollbar-width: thin; scrollbar-color: #00EAFF rgba(0, 0, 0, 0.2); }
    .input-wrapper:focus-within { border-color: #00EAFF; box-shadow: 0 0 10px 0px rgba(0, 234, 255, 0.5); }
    .action-button:hover { box-shadow: 0 0 20px 0px rgba(0, 234, 255, 0.6); }
    .option-button:hover { border-color: #00EAFF; background-color: rgba(0, 234, 255, 0.1); }
  `;
  document.head.append(style);
}

const CustomScrollView = (props: any) => {
  const ref = useRef<ScrollView>(null);
  useEffect(() => {
    if (Platform.OS === 'web' && ref.current) {
      const node = findNodeHandle(ref.current);
      if (node) { (node as HTMLElement).classList.add('custom-scrollbar'); }
    }
  }, []);
  return <ScrollView {...props} ref={ref} />;
};

export default function Wizard({ onComplete, wizardId, onClose, onBack }: WizardProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [answerHistory, setAnswerHistory] = useState<AnswerHistory[]>([]);
  const [stepOptions, setStepOptions] = useState<Record<number, StepOption[]>>({});
  const [steps, setSteps] = useState<WizardStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generatedDisplayText, setGeneratedDisplayText] = useState<Record<number, string>>({});
  const [displayTextLoading, setDisplayTextLoading] = useState<Record<number, boolean>>({});
  const [imageLoaded, setImageLoaded] = useState(false);

  // --- Data Fetching and Logic ---
  useEffect(() => {
    setLoading(true); setError(null);
    fetch(`${API.AI_BASE_URL}/wizard-steps/wizard/${wizardId}`,{headers: API.authHeaders()})
      .then(res => { if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); return res.json(); })
      .then((data: WizardStep[]) => setSteps(data.sort((a, b) => a.stepNumber - b.stepNumber)))
      .catch(err => { console.error('Fetch steps error:', err); setError(`Failed to load steps: ${err.message}`); })
      .finally(() => setLoading(false));
  }, [wizardId]);

  useEffect(() => {
    if (!loading && steps.length > 0) {
      const currentStep = steps[currentStepIndex];
      if (currentStep.type === 0 && currentStep.promptTemplate && !stepOptions[currentStep.stepId]) {
        getStepOptions(currentStep, answerHistory)
          .then(response => setStepOptions(prev => ({ ...prev, [currentStep.stepId]: response.items })))
          .catch(err => { console.error('Failed to fetch options:', err); setStepOptions(prev => ({ ...prev, [currentStep.stepId]: [] })); });
      } else if (currentStep.type === 1 && currentStep.displayText && !generatedDisplayText[currentStep.stepId] && !displayTextLoading[currentStep.stepId]) {
        setDisplayTextLoading(prev => ({ ...prev, [currentStep.stepId]: true }));
        getStepDisplay(currentStep.displayText!, answerHistory)
          .then(displayText => setGeneratedDisplayText(prev => ({ ...prev, [currentStep.stepId]: displayText })))
          .catch(err => { console.error('Failed to fetch display text:', err); setGeneratedDisplayText(prev => ({ ...prev, [currentStep.stepId]: currentStep.displayText || '' })); })
          .finally(() => setDisplayTextLoading(prev => ({ ...prev, [currentStep.stepId]: false })));
      }
    }
  }, [loading, steps, currentStepIndex, answerHistory]);

  const handleAnswerSelect = (value: string) => {
    const currentStep = steps[currentStepIndex];
    setAnswers(prev => ({ ...prev, [currentStep.stepId]: value }));
    setAnswerHistory(prev => {
      const newHistory = prev.filter(h => h.stepId !== currentStep.stepId);
      newHistory.push({ stepId: currentStep.stepId, title: currentStep.stepTitle, selectedOption: value });
      setStepOptions(prevOptions => {
        const newOptions = { ...prevOptions };
        steps.forEach((step, index) => { if (index > currentStepIndex) { delete newOptions[step.stepId]; } });
        return newOptions;
      });
      return newHistory;
    });
  };

  const handleNext = () => { currentStepIndex === steps.length - 1 ? onComplete(answers) : setCurrentStepIndex(prev => prev + 1); };
  const handleBack = () => { setCurrentStepIndex(prev => prev - 1); };

  // --- Handler for the skip functionality ---
  const handleSkip = () => {
    const currentStep = steps[currentStepIndex];
    const newAnswers = { ...answers };
    delete newAnswers[currentStep.stepId];
    setAnswers(newAnswers);
    setAnswerHistory(prev => prev.filter(h => h.stepId !== currentStep.stepId));

    if (currentStepIndex === steps.length - 1) {
      onComplete(newAnswers);
    } else {
      setCurrentStepIndex(prev => prev + 1);
    }
  };

  if (loading) return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#00EAFF" /></View>;
  if (error) return <View style={styles.loadingContainer}><Text style={styles.errorText}>{error}</Text></View>;
  if (steps.length === 0) return <View style={styles.loadingContainer}><Text style={styles.errorText}>No steps available for this wizard.</Text></View>;

  const currentStep = steps[currentStepIndex];
  const isLastStep = currentStepIndex === steps.length - 1;
  const isNextDisabled = (currentStep.type === 0 || currentStep.type === 2) && !answers[currentStep.stepId];

  // --- Render Functions for Each Step Type ---
  const renderContent = () => {
    switch (currentStep.type) {
      case 0:
        return (
          <View style={styles.contentContainer}>
            {!stepOptions[currentStep.stepId] ? <ActivityIndicator color="#00EAFF" /> :
              stepOptions[currentStep.stepId].map(option => (
                <TouchableOpacity key={option.value} className="option-button" style={[styles.optionButton, answers[currentStep.stepId] === option.label && styles.selectedOptionButton]} onPress={() => handleAnswerSelect(option.label)}>
                  <View style={[styles.radioCircle, answers[currentStep.stepId] === option.label && styles.radioCircleSelected]}>{answers[currentStep.stepId] === option.label && <View style={styles.radioInnerCircle} />}</View>
                  <Text style={styles.optionText}>{option.label}</Text>
                </TouchableOpacity>
              ))
            }
          </View>
        );
      case 2:
        return (
          <View style={styles.contentContainer}>
            <View style={styles.inputRow}>
              {currentStep.contextKey && <Text style={styles.inputLabel}>{currentStep.contextKey.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</Text>}
              <View className="input-wrapper" style={styles.inputWrapper}>
                <TextInput style={styles.textInput} value={answers[currentStep.stepId] || ''} onChangeText={handleAnswerSelect} placeholder="Type your answer here..." placeholderTextColor="#666" />
              </View>
            </View>
          </View>
        );
      case 1:
      default:
        const isMobile = Platform.OS === 'ios' || Platform.OS === 'android';
        const markdownStyles = {
          body: { color: '#E0E0E0', fontSize: isMobile ? 18 : 16, fontFamily: 'InterDisplay-Regular', lineHeight: isMobile ? 28 : 26 },
          heading1: { marginBottom: 16, color: '#00EAFF', fontSize: isMobile ? 26 : 24, fontWeight: 'bold' },
          heading2: { marginBottom: 16, color: '#FFFFFF', fontSize: isMobile ? 22 : 20, fontWeight: 'bold' },
          heading3: { marginBottom: 16, color: '#CCCCCC', fontSize: isMobile ? 20 : 18, fontWeight: 'bold' },
          paragraph: { marginBottom: 16, fontSize: isMobile ? 18 : 16, lineHeight: isMobile ? 28 : 26 },
          bullet_list: { marginBottom: 16, paddingLeft: 10, fontSize: isMobile ? 18 : 16, lineHeight: isMobile ? 28 : 26 },
          ordered_list: { marginBottom: 16, paddingLeft: 10, fontSize: isMobile ? 18 : 16, lineHeight: isMobile ? 28 : 26 },
          list_item: { fontSize: isMobile ? 18 : 16, lineHeight: isMobile ? 28 : 26 },
          text: { fontSize: isMobile ? 18 : 16, lineHeight: isMobile ? 28 : 26 },
          blockquote: { marginBottom: 16, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 12, borderLeftColor: '#00EAFF', borderLeftWidth: 4, borderRadius: 4, fontSize: isMobile ? 18 : 16, lineHeight: isMobile ? 28 : 26 },
          hr: { marginVertical: 24, backgroundColor: 'rgba(255, 255, 255, 0.2)', height: 1 },
        };
        return (
          <View style={styles.contentContainer}>
            {displayTextLoading[currentStep.stepId] ? <ActivityIndicator color="#00EAFF" /> :
              <Markdown style={markdownStyles}>{generatedDisplayText[currentStep.stepId] || currentStep.displayText || 'No content to display.'}</Markdown>
            }
          </View>
        );
    }
  };

  return (
    <>
      <View style={styles.header}>
        <CustomIcon name="shield-check" size={24} color="#00EAFF" />
        <Text style={styles.headerTitle}>{currentStep.stepTitle}</Text>
        {onBack && currentStepIndex === 0 ? (
          <TouchableOpacity onPress={onBack} style={styles.closeButton}>
            <CustomIcon name="minus" size={28} color="#999" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CustomIcon name="close" size={28} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      <CustomScrollView contentContainerStyle={styles.scrollContent}>
        {renderContent()}
      </CustomScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity className="action-button" onPress={handleBack} disabled={currentStepIndex === 0} style={[styles.backButton, currentStepIndex === 0 && { opacity: 0.3 }]}>
            <Text style={styles.backButtonText}>BACK</Text>
          </TouchableOpacity>
          
          {/* --- MODIFIED: Skip button is now in the footer, between Back and Next --- */}
          {currentStep.type !== 1 && (
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>
                {isLastStep ? 'Skip & Confirm' : 'Skip Question'}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity className="action-button" onPress={handleNext} disabled={isNextDisabled} style={isNextDisabled && { opacity: 0.5 }}>
            <ImageBackground source={buttonBgImage} style={styles.nextButton} imageStyle={{ borderRadius: styles.nextButton.borderRadius, opacity: imageLoaded ? 1 : 0 }} onLoad={() => setImageLoaded(false)}>
              <Text style={styles.nextButtonText}>{isLastStep ? 'CONFIRM' : 'NEXT'}</Text>
            </ImageBackground>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  // MODIFIED: Reduced vertical padding for a more compact header
  header: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255, 255, 255, 0.1)', flexShrink: 0 },
  headerTitle: { color: '#FFFFFF', fontSize: 18, fontFamily: 'InterDisplay-SemiBold', marginLeft: 12, flex: 1 },
  closeButton: { padding: 5 },
  scrollContent: { padding: 25 },
  contentContainer: { flex: 1, gap: 15 },
  errorText: { color: '#FF8888', textAlign: 'center', padding: 20, fontSize: 16, fontFamily: 'Inter-Medium' },
  optionButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 15, backgroundColor: 'rgba(0, 0, 0, 0.25)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', transition: 'border-color 0.3s ease, background-color 0.3s ease' },
  selectedOptionButton: { borderColor: '#00EAFF', backgroundColor: 'rgba(0, 234, 255, 0.15)' },
  radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.4)', marginRight: 15, justifyContent: 'center', alignItems: 'center' },
  radioCircleSelected: { borderColor: '#00EAFF' },
  radioInnerCircle: { width: 12, height: 12, borderRadius: 6, backgroundColor: '#00EAFF' },
  optionText: { color: '#E0E0E0', fontSize: 17, fontFamily: 'InterDisplay-Regular', flex: 1 },
  inputRow: { marginBottom: 15 },
  inputLabel: { color: '#CCCCCC', fontSize: 14, fontFamily: 'Inter-Medium', marginBottom: 8, paddingLeft: 4 },
  inputWrapper: { backgroundColor: 'rgba(0, 0, 0, 0.4)', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)', transition: 'border-color 0.3s ease, box-shadow 0.3s ease' },
  textInput: { color: '#FFFFFF', paddingHorizontal: 15, paddingVertical: 12, fontSize: 16, fontFamily: 'InterDisplay-Regular', borderWidth: 0, backgroundColor: 'transparent', outlineStyle: 'none' },
  // MODIFIED: Reduced vertical padding for a more compact footer
  footer: { paddingVertical: 15, paddingHorizontal: 20, borderTopWidth: 1, borderTopColor: 'rgba(255, 255, 255, 0.1)' },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  // MODIFIED: Reduced vertical padding for a more compact button
  backButton: { paddingVertical: 10, paddingHorizontal: 25, borderRadius: 10, backgroundColor: 'rgba(255, 255, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.2)' },
  backButtonText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold', fontFamily: 'InterDisplay-SemiBold', letterSpacing: 1 },
  // MODIFIED: Reduced vertical padding for a more compact button
  nextButton: { paddingVertical: 12, paddingHorizontal: 35, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#00EAFF', transition: 'box-shadow 0.3s ease', overflow: 'hidden' },
  nextButtonText: { color: '#000000', fontSize: 16, fontWeight: 'bold', fontFamily: 'InterDisplay-SemiBold', letterSpacing: 1 },

  // NEW: Styles for the Skip button in the footer
  skipButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignSelf: 'center',
    opacity: 0.7,
    transition: 'opacity 0.2s ease',
  },
  skipButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontFamily: 'InterDisplay-Regular',
    textDecorationLine: 'underline',
  },
});