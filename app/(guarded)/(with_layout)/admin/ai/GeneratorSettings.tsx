import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  Animated,
} from 'react-native';
import { Button, ActivityIndicator/*, Checkbox*/ } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';
import { Picker } from '@react-native-picker/picker';
import { launchImageLibrary } from 'react-native-image-picker';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { API } from '@/api/api';

/*
interface Wizard {
  wizardId: number;
  wizardCode: string;
  coursePublicId: string;
  courseName: string;
  iconUrl: string;
  createdAt: string;
}
*/

interface ContentGenerator {
  contentGeneratorId: number;
  wizardCode: string;
  coursePublicId: string;
  courseName: string;
  chapterNumber: number | null;
  chapterPublicId: string | null;
  moduleName: string;
  promptTemplate: string;
  contextKey: string | null;
  buttonName: string | null;
  buttonIconUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface GeneratorSettingsProps {
  courseName: string;
  chapters: any[];
  courseId: string; // coursePublicId (UUID)
}

export default function GeneratorSettings({ courseName, chapters, courseId }: GeneratorSettingsProps) {
  const [selectedModule, setSelectedModule] = useState(chapters[0].title || '');
  // const [selectedWizardCodes, setSelectedWizardCodes] = useState<string[]>([]);
  const [promptTemplate, setPromptTemplate] = useState('');
  const [contextKey, setContextKey] = useState('');
  const [buttonName, setButtonName] = useState('');
  const [buttonIconUrl, setButtonIconUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [icon, setIcon] = useState<string | null>(null);
  const [existingGenerators, setExistingGenerators] = useState<ContentGenerator[]>([]);
  // const [wizards, setWizards] = useState<Wizard[]>([]);
  const [selectedGeneratorId, setSelectedGeneratorId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  // const [wizardLoading, setWizardLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  // Animation for plus button
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Store initial form state for comparison
  const initialFormState = useRef<{
    // wizardCodes: string[];
    promptTemplate: string;
    contextKey: string | null;
    buttonName: string | null;
    buttonIconUrl: string | null;
    selectedModule: string;
  } | null>(null);

  const { width } = Dimensions.get('window');
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;

  useEffect(() => {
    console.log('Course ID:', courseId);
    console.log('Chapter Names:', chapters[0].title);
    fetchContentGenerators();
    // fetchWizards();
  }, [courseId]);

  const fetchContentGenerators = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/content-generators/course/${courseId}`,
        {
          method: 'GET',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch content generators`);
      }
      const data: ContentGenerator[] = await response.json();
      console.log('Raw API response:', data);
      setExistingGenerators(data);
      if ( chapters.length > 0 && !chapters.some((chapter) => chapter.title === selectedModule)) {
        setSelectedModule(chapters[0].title || '');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching content generators: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /*
  const fetchWizards = async () => {
    setWizardLoading(true);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/wizards`,
        {
          method: 'GET',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch wizards`);
      }
      const data: Wizard[] = await response.json();
      // Filter wizards by coursePublicId
      const filteredWizards = data.filter((wizard) => wizard.coursePublicId === courseId);
      setWizards(filteredWizards);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching wizards: ${errorMessage}`);
      console.error(err);
    } finally {
      setWizardLoading(false);
    }
  };
  */

  const resetForm = () => {
    // setSelectedWizardCodes([]);
    setPromptTemplate('');
    setContextKey('');
    setButtonName('');
    setButtonIconUrl('');
    setIcon(null);
    setSelectedGeneratorId(null);
    setSelectedModule(chapters[0].title || '');
    setIsFormModified(false);
    initialFormState.current = null;
  };

  const handleSelectGenerator = (generator: ContentGenerator) => {
    // setSelectedWizardCodes([generator.wizardCode]); // Assuming single wizardCode for existing generators; adjust if multiple
    setPromptTemplate(generator.promptTemplate);
    setContextKey(generator.contextKey || '');
    setButtonName(generator.buttonName || '');
    setButtonIconUrl(generator.buttonIconUrl || '');
    const matchingChapter = chapters.find(ch => ch.title === generator.moduleName);
    setSelectedModule( matchingChapter ? matchingChapter.title : (chapters[0]?.title || ''));
    setSelectedGeneratorId(generator.contentGeneratorId);
    initialFormState.current = {
      // wizardCodes: [generator.wizardCode],
      promptTemplate: generator.promptTemplate,
      contextKey: generator.contextKey || '',
      buttonName: generator.buttonName || '',
      buttonIconUrl: generator.buttonIconUrl || '',
      selectedModule: matchingChapter ? matchingChapter.title : (chapters[0]?.title || ''),
    };
    setIsFormModified(false);
  };

  const handleDeleteGenerator = async () => {
    if (!selectedGeneratorId) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/content-generators/${selectedGeneratorId}`,
        {
          method: 'DELETE',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete content generator: ${errorData.error || response.status}`);
      }
      await fetchContentGenerators();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error deleting content generator: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  /*
  const handleToggleWizardCode = (wizardCode: string) => {
    setSelectedWizardCodes((prev) =>
      prev.includes(wizardCode)
        ? prev.filter((code) => code !== wizardCode)
        : [...prev, wizardCode]
    );
    setIsFormModified(true);
  };
  */

  useEffect(() => {
    if (selectedGeneratorId && initialFormState.current) {
      const isModified =
        // JSON.stringify(selectedWizardCodes.sort()) !== JSON.stringify(initialFormState.current.wizardCodes.sort()) ||
        promptTemplate !== initialFormState.current.promptTemplate ||
        contextKey !== initialFormState.current.contextKey ||
        buttonName !== initialFormState.current.buttonName ||
        buttonIconUrl !== initialFormState.current.buttonIconUrl ||
        selectedModule !== initialFormState.current.selectedModule;
      setIsFormModified(isModified);
    }
  }, [/*selectedWizardCodes,*/ promptTemplate, contextKey, buttonName, buttonIconUrl, selectedModule]);

  const handleSave = async () => {
    if (!selectedModule) {
      setError('Please select a module');
      return;
    }

    const selectedChapter = chapters.find(ch => ch.title === selectedModule);
    if (!selectedChapter) {
      setError('Selected chapter not found');
      return;
    }
    
    /*
    if (selectedWizardCodes.length === 0) {
      setError('Please select at least one wizard code');
      return;
    }
    */
    setIsSaving(true);
    setError(null);
    try {
      const chapterNumber = selectedChapter.order ?? null;     // ← use real order if exists
      const chapterPublicId = selectedChapter.publicId; 
      const payload = {
        wizardCode: '', // Set to empty string or null as wizardCode is not sent
        coursePublicId: courseId,
        courseName,
        chapterNumber: chapterNumber > 0 ? chapterNumber : null,
        chapterPublicId: chapterPublicId,
        moduleName: selectedModule,
        promptTemplate,
        contextKey: contextKey || null,
        buttonName: buttonName || null,
        buttonIconUrl: buttonIconUrl || null,
      };
      console.log('Saving payload:', payload);

      if (selectedGeneratorId /*&& selectedWizardCodes.length === 1*/) {
        const response = await fetch(
          `${API.AI_BASE_URL}/content-generators/${selectedGeneratorId}`,
          {
            method: 'PUT',
            headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({
              wizardCode: '', // Set to empty string or null
              courseName,
              chapterNumber: payload.chapterNumber,
              moduleName: selectedModule,
              promptTemplate,
              contextKey,
              buttonName: buttonName || null,
              buttonIconUrl: buttonIconUrl || null,
            }),
          }
        );
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to update content generator: ${errorData.error || response.status}`);
        }
      } else {
        const response = await fetch(`${API.AI_BASE_URL}/content-generators`, {
          method: 'POST',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to create content generator: ${errorData.error || response.status}`);
        }
      }

      await fetchContentGenerators();
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error saving content generator: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImagePick = () => {
    launchImageLibrary(
      {
        mediaType: 'photo',
        maxWidth: 100,
        maxHeight: 100,
        quality: 1,
      },
      (response) => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorCode) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets[0].uri) {
          setIcon(response.assets[0].uri);
          setButtonIconUrl(response.assets[0].uri);
        }
      }
    );
  };

  const handleAddNewGenerator = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    setShowTooltip(true);
    setTimeout(() => setShowTooltip(false), 1000);

    resetForm();
  };


    const sortedChapters = [...chapters].sort((a, b) => {
      const aOrder = a.order ?? Number.MAX_SAFE_INTEGER;
      const bOrder = b.order ?? Number.MAX_SAFE_INTEGER;
      return aOrder - bOrder;
    });
 


return (
    <View
      style={[
        styles.content,
        isMobile && styles.contentMobile,
        isTablet && styles.contentTablet,
      ]}
    >
      <View style={[styles.leftSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.courseName}>Course: {courseName || 'Course Name'}</Text>
        <View style={styles.divider} />
        <Text style={styles.sectionLabel}>Select Module</Text>
        <Picker
          selectedValue={selectedModule}
          onValueChange={(itemValue) => setSelectedModule(itemValue)}
          style={styles.picker}
        >
          {chapters.length > 0 ? (
            [...chapters]
              .sort((a, b) => (b.order ?? -1) - (a.order ?? -1)) // highest first
              .map((chapter,i) => (
                <Picker.Item
                  key={chapter.publicId}
                  label={`${i=1+i}. ${chapter.title}`}
                  value={chapter.title}
                />
              ))
          ) : (
            <Picker.Item label="No modules available" value="" />
          )}


        </Picker>
        <View style={styles.iconSelection}>
          <Text style={styles.sectionLabel}>Icon Selection</Text>
          {icon ? (
            <TouchableOpacity onPress={handleImagePick}>
              <Image source={{ uri: icon }} style={styles.iconImage} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.iconUploadButton} onPress={handleImagePick}>
              <CustomIcon name="plus" size={20} color="#FAFAFB" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={[styles.middleSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>
          {selectedGeneratorId ? 'Edit Content Generator' : 'Create New Content Generator'}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <ScrollView style={styles.formScroll}>
          <View style={styles.formContainer}>
            {/*
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Wizard Codes</Text>
              {wizardLoading ? (
                <ActivityIndicator size="small" color="#FAFAFB" />
              ) : wizards.length === 0 ? (
                <Text style={styles.emptyText}>No wizard codes available for this course</Text>
              ) : (
                <FlatList
                  data={wizards}
                  keyExtractor={(item) => item.wizardCode}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.wizardCodeItem}
                      onPress={() => handleToggleWizardCode(item.wizardCode)}
                    >
                      <Checkbox
                        status={selectedWizardCodes.includes(item.wizardCode) ? 'checked' : 'unchecked'}
                        onPress={() => handleToggleWizardCode(item.wizardCode)}
                        color="#D22A38"
                        uncheckedColor="#888"
                      />
                      <Text style={styles.wizardCodeText}>{item.wizardCode}</Text>
                    </TouchableOpacity>
                  )}
                  style={styles.wizardCodeList}
                />
              )}
            </View>
            */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prompt Template</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={promptTemplate}
                onChangeText={setPromptTemplate}
                multiline
                numberOfLines={10}
                placeholder="e.g., Generate a blog post for {topic}."
                placeholderTextColor="#888"
              />
            </View>
            {/* <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Context Key</Text>
              <TextInput
                style={styles.input}
                value={contextKey}
                onChangeText={setContextKey}
                placeholder="e.g., blog_post"
                placeholderTextColor="#888"
              />
            </View> */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Button Name</Text>
              <TextInput
                style={styles.input}
                value={buttonName}
                onChangeText={setButtonName}
                placeholder="e.g., Generate Content"
                placeholderTextColor="#888"
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Button Icon URL</Text>
              <TextInput
                style={styles.input}
                value={buttonIconUrl}
                onChangeText={setButtonIconUrl}
                placeholder="e.g., https://example.com/icon.png"
                placeholderTextColor="#888"
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.formActions}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={
              isSaving ||
              // selectedWizardCodes.length === 0 ||
              !promptTemplate ||
              !selectedModule ||
              (selectedGeneratorId && !isFormModified)
            }
            style={[styles.saveButton, selectedGeneratorId && !isFormModified ? styles.disabledButton : null]}
            labelStyle={styles.buttonLabel}
          >
            {isSaving ? <ActivityIndicator size="small" color="#FAFAFB" /> : 'Save'}
          </Button>
          {selectedGeneratorId && (
            <Button
              mode="outlined"
              onPress={handleDeleteGenerator}
              style={styles.deleteButton}
              labelStyle={styles.buttonLabel}
              theme={{ colors: { outline: '#D22A38' } }}
            >
              Delete
            </Button>
          )}
          <Button
            mode="outlined"
            onPress={resetForm}
            style={styles.cancelButton}
            labelStyle={styles.buttonLabel}
            theme={{ colors: { outline: '#D22A38' } }}
          >
            Reset
          </Button>
        </View>
      </View>

      <View style={[styles.rightSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>Existing Content Generators for this Course</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#FAFAFB" />
        ) : existingGenerators.length === 0 ? (
          <Text style={styles.emptyText}>
            {error ? error : `No generators found for ${courseName}`}
          </Text>
        ) : (
          <FlatList
            data={existingGenerators}
            keyExtractor={(item) => `${item.contentGeneratorId}`}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectGenerator(item)}>
                <View
                  style={[
                    styles.stepCard,
                    selectedGeneratorId === item.contentGeneratorId && styles.selectedStepCard,
                  ]}
                >
                  <Text style={styles.stepTitle}>{item.moduleName}</Text>
                  <Text style={styles.stepDetails}>
                    {/*Wizard Code: {item.wizardCode} | */}Prompt:{' '}
                    {item.promptTemplate
                      ? item.promptTemplate.substring(0, 20) +
                        (item.promptTemplate.length > 20 ? '...' : '')
                      : 'No prompt available'}
                  </Text>
                  {item.chapterNumber && (
                    <Text style={styles.stepDetails}>Chapter: {item.chapterNumber}</Text>
                  )}
                </View>
              </TouchableOpacity>
            )}
            ListFooterComponent={
              <View style={styles.addNewContainer}>
                <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                  <TouchableOpacity style={styles.addNewButton} onPress={handleAddNewGenerator}>
                    <CustomIcon name="plus" size={20} color="#FAFAFB" />
                  </TouchableOpacity>
                </Animated.View>
                {showTooltip && (
                  <View style={styles.tooltip}>
                    <Text style={styles.tooltipText}>Add New Generator</Text>
                  </View>
                )}
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    padding: moderateScale(8),
    height: moderateScale(350),
  },
  contentMobile: {
    flexDirection: 'column',
    height: 'auto',
  },
  contentTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  leftSection: {
    flex: 1,
    paddingRight: moderateScale(8),
  },
  sectionMobile: {
    paddingRight: 0,
    marginBottom: moderateScale(8),
  },
  courseName: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
    fontWeight: '600',
    marginBottom: moderateScale(4),
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D46',
    marginVertical: moderateScale(4),
  },
  sectionLabel: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  picker: {
    backgroundColor: '#252525',
    color: '#FAFAFB',
    borderRadius: moderateScale(4),
    padding: moderateScale(4),
  },
  iconSelection: {
    marginTop: moderateScale(4),
  },
  iconImage: {
    width: moderateScale(40),
    height: moderateScale(40),
    borderRadius: moderateScale(4),
  },
  iconUploadButton: {
    width: moderateScale(40),
    height: moderateScale(40),
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(4),
  },
  middleSection: {
    flex: 2,
    paddingHorizontal: moderateScale(8),
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#3D3D46',
  },
  formScroll: {
    flex: 1,
  },
  formContainer: {
    backgroundColor: '#252525',
    borderRadius: moderateScale(4),
    padding: moderateScale(8),
  },
  inputGroup: {
    marginBottom: moderateScale(4),
  },
  inputLabel: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
    marginBottom: moderateScale(2),
  },
  input: {
    backgroundColor: '#333',
    color: '#FAFAFB',
    padding: moderateScale(6),
    borderRadius: moderateScale(4),
    fontSize: moderateScale(10),
  },
  multilineInput: {
    minHeight: moderateScale(40),
    textAlignVertical: 'top',
  },
  formActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: moderateScale(4),
    marginTop: moderateScale(8),
  },
  saveButton: {
    backgroundColor: '#D22A38',
    borderRadius: moderateScale(4),
  },
  disabledButton: {
    backgroundColor: '#555',
  },
  deleteButton: {
    borderRadius: moderateScale(4),
    borderColor: '#D22A38',
  },
  cancelButton: {
    borderRadius: moderateScale(4),
    borderColor: '#D22A38',
  },
  buttonLabel: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
  },
  rightSection: {
    flex: 1,
    paddingLeft: moderateScale(8),
  },
  stepCard: {
    backgroundColor: '#252525',
    borderRadius: moderateScale(4),
    padding: moderateScale(6),
    marginBottom: moderateScale(4),
  },
  stepTitle: {
    color: '#FAFAFB',
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  stepDetails: {
    color: '#888',
    fontSize: moderateScale(10),
  },
  emptyText: {
    color: '#888',
    fontSize: moderateScale(10),
    textAlign: 'center',
    marginTop: moderateScale(8),
  },
  errorText: {
    color: '#D22A38',
    fontSize: moderateScale(10),
    marginBottom: moderateScale(4),
  },
  selectedStepCard: {
    borderColor: '#D22A38',
    borderWidth: 1,
  },
  addNewContainer: {
    alignItems: 'center',
    marginTop: moderateScale(8),
    position: 'relative',
  },
  addNewButton: {
    width: moderateScale(32),
    height: moderateScale(32),
    backgroundColor: '#D22A38',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: moderateScale(16),
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(3),
  },
  tooltip: {
    position: 'absolute',
    top: -moderateScale(30),
    backgroundColor: '#333',
    padding: moderateScale(4),
    borderRadius: moderateScale(4),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: moderateScale(2),
  },
  tooltipText: {
    color: '#FAFAFB',
    fontSize: moderateScale(8),
    fontWeight: '500',
  },
  /*
  wizardCodeList: {
    maxHeight: moderateScale(100),
    backgroundColor: '#333',
    borderRadius: moderateScale(4),
    padding: moderateScale(4),
  },
  wizardCodeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: moderateScale(4),
  },
  wizardCodeText: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
    marginLeft: moderateScale(8),
  },
  */
});