import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { moderateScale } from 'react-native-size-matters';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import WizardSettings from './WizardSettings';
import GeneratorSettings from './GeneratorSettings';
import PromptSettings from './PromptSettings';

interface AISettingsModalProps {
  visible: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  chapters: any[];
}

export default function AISettingsModal({
  visible,
  onClose,
  courseId,
  courseName,
  chapters,
}: AISettingsModalProps) {
  const [selectedTab, setSelectedTab] = useState<'Wizard' | 'Content' | 'Prompts'>('Wizard');
  const [hoveredTab, setHoveredTab] = useState<'Wizard' | 'Content' | 'Prompts' | null>(null);

  const { width } = Dimensions.get('window');
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;

  const handleTabPress = (tab: 'Wizard' | 'Content' | 'Prompts') => {
    setSelectedTab(tab);
  };

  return (
    <Modal visible={visible} onRequestClose={onClose} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View
          style={[
            styles.modalContainer,
            isMobile && styles.modalContainerMobile,
            isTablet && styles.modalContainerTablet,
          ]}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>AI Settings</Text>
            <View style={styles.toggleContainer}>
              <View style={styles.toggleBackground}>
                <TouchableOpacity
                  onPress={() => handleTabPress('Wizard')}
                  onPressIn={() => setHoveredTab('Wizard')}
                  onPressOut={() => setHoveredTab(null)}
                  style={[
                    styles.toggleButton,
                    selectedTab === 'Wizard' && styles.activeButton,
                    hoveredTab === 'Wizard' && styles.hoveredButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      selectedTab === 'Wizard' ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    Wizard
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTabPress('Content')}
                  onPressIn={() => setHoveredTab('Content')}
                  onPressOut={() => setHoveredTab(null)}
                  style={[
                    styles.toggleButton,
                    selectedTab === 'Content' && styles.activeButton,
                    hoveredTab === 'Content' && styles.hoveredButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      selectedTab === 'Content' ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    Content
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleTabPress('Prompts')}
                  onPressIn={() => setHoveredTab('Prompts')}
                  onPressOut={() => setHoveredTab(null)}
                  style={[
                    styles.toggleButton,
                    selectedTab === 'Prompts' && styles.activeButton,
                    hoveredTab === 'Prompts' && styles.hoveredButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      selectedTab === 'Prompts' ? styles.activeText : styles.inactiveText,
                    ]}
                  >
                    Prompts
                  </Text>
                </TouchableOpacity>
                <View
                  style={[
                    styles.toggleIndicator,
                    selectedTab === 'Content' && styles.toggleIndicatorMiddle,
                    selectedTab === 'Prompts' && styles.toggleIndicatorRight,
                  ]}
                />
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <CustomIcon name="close" size={20} color="#FAFAFB" />
            </TouchableOpacity>
          </View>
          {selectedTab === 'Wizard' ? (
            <WizardSettings courseName={courseName} courseId={courseId} />
          ) : selectedTab === 'Content' ? (
            <GeneratorSettings courseName={courseName} chapters={chapters} courseId={courseId} />
          ) : (
            <PromptSettings courseName={courseName} courseId={courseId} />
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    maxWidth: moderateScale(1000),
    backgroundColor: '#1C1C1C',
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  modalContainerMobile: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
  },
  modalContainerTablet: {
    width: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: moderateScale(8),
    borderBottomWidth: 1,
    borderBottomColor: '#3D3D46',
  },
  headerTitle: {
    color: '#FAFAFB',
    fontSize: moderateScale(14),
    fontWeight: '600',
  },
  toggleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleBackground: {
    flexDirection: 'row',
    backgroundColor: '#252525',
    borderRadius: moderateScale(16),
    borderWidth: 1,
    borderColor: '#3D3D46',
    position: 'relative',
    padding: moderateScale(2),
  },
  toggleButton: {
    paddingVertical: moderateScale(4),
    paddingHorizontal: moderateScale(12),
    borderRadius: moderateScale(14),
    zIndex: 2,
  },
  activeButton: {
    backgroundColor: 'transparent',
  },
  hoveredButton: {
    backgroundColor: '#333',
  },
  toggleText: {
    fontSize: moderateScale(10),
    fontWeight: '500',
    textAlign: 'center',
    zIndex: 3,
  },
  activeText: {
    color: '#FAFAFB',
  },
  inactiveText: {
    color: '#888',
  },
  toggleIndicator: {
    position: 'absolute',
    left: moderateScale(2),
    top: moderateScale(2),
    bottom: moderateScale(2),
    width: '33.33%',
    backgroundColor: '#D22A38',
    borderRadius: moderateScale(14),
    zIndex: 0,
    transitionDuration: '0.3s',
  },
  toggleIndicatorMiddle: {
    left: '33.33%',
  },
  toggleIndicatorRight: {
    left: '66.66%',
  },
  closeButton: {
    padding: moderateScale(4),
  },
});