import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Switch,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { Button, ActivityIndicator, SegmentedButtons } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';
import CustomIcon from '@/components/custom_icon/CustomIcon';
import { API } from '@/api/api';

interface Wizard {
  wizardId: number;
  wizardCode: string;
  coursePublicId: string;
  courseName: string;
  iconUrl: string;
  createdAt: string;
}

interface WizardStep {
  stepId: number;
  wizardId: number;
  stepNumber: number;
  stepTitle: string;
  promptTemplate: string;
  inputs: string | null;
  type: number; // 0 for Prompt, 1 for Display, 2 for Input
  displayText: string;
  saveToContext: boolean;
  contextKey: string | null;
  marksCompletion: boolean;
  unlocksModules: string | null;
  createdAt: string;
  updatedAt: string;
}

// --- NEW --- Interface for the stored data entries, required for the deletion logic.
interface StoredWizardData {
    id: number;
    wizardId: number;
    wizardStepNumber: number;
    studentPublicId: string;
    question: string;
    answer: string;
    createdAt: string;
    updatedAt: string;
}

interface WizardSettingsProps {
  courseName: string;
  courseId: string;
}

export default function WizardSettings({ courseName, courseId }: WizardSettingsProps) {
  const [wizardCode, setWizardCode] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [stepNumber, setStepNumber] = useState('');
  const [stepTitle, setStepTitle] = useState('');
  const [promptTemplate, setPromptTemplate] = useState('');
  const [inputs, setInputs] = useState('');
  const [type, setType] = useState<0 | 1 | 2>(0);
  const [displayText, setDisplayText] = useState('');
  const [saveToContext, setSaveToContext] = useState(false);
  const [contextKey, setContextKey] = useState('');
  const [marksCompletion, setMarksCompletion] = useState(false);
  const [unlocksModules, setUnlocksModules] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [wizards, setWizards] = useState<Wizard[]>([]);
  const [wizardSteps, setWizardSteps] = useState<WizardStep[]>([]);
  const [selectedWizardId, setSelectedWizardId] = useState<number | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [isWizardsLoading, setIsWizardsLoading] = useState(true);
  const [isStepsLoading, setIsStepsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormModified, setIsFormModified] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isAddingWizard, setIsAddingWizard] = useState(false);
  const [newWizardCode, setNewWizardCode] = useState('');
  const [newIconUrl, setNewIconUrl] = useState('');
  const [isEditingWizard, setIsEditingWizard] = useState<number | null>(null);
  const [editedWizardCode, setEditedWizardCode] = useState('');
  const [editedIconUrl, setEditedIconUrl] = useState('');

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const initialFormState = useRef<{
    wizardCode: string;
    stepNumber: string;
    stepTitle: string;
    promptTemplate: string;
    inputs: string;
    type: number;
    displayText: string;
    saveToContext: boolean;
    contextKey: string;
    marksCompletion: boolean;
    unlocksModules: string;
  } | null>(null);

  const { width } = Dimensions.get('window');
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;

  const fetchWizards = useCallback(async () => {
    setIsWizardsLoading(true);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/courses/${courseId}/wizards`,
        {
          method: 'GET',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch wizards`);
      }
      const data: Wizard[] = await response.json();
      setWizards(data);
      if (data.length > 0 && !selectedWizardId) {
        setSelectedWizardId(data[0].wizardId);
        setWizardCode(data[0].wizardCode);
        setIconUrl(data[0].iconUrl);
        await fetchWizardSteps(data[0].wizardId);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching wizards: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsWizardsLoading(false);
    }
  }, [courseId]);

  const fetchWizardSteps = useCallback(async (wizardId: number) => {
    setIsStepsLoading(true);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/wizard-steps/wizard/${wizardId}`,
        {
          method: 'GET',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to fetch wizard steps`);
      }
      const data: WizardStep[] = await response.json();
      setWizardSteps(data);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching wizard steps: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsStepsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWizards();
  }, [fetchWizards]);

  const resetForm = () => {
    const selectedWizard = wizards.find((w) => w.wizardId === selectedWizardId);
    setWizardCode(selectedWizard ? selectedWizard.wizardCode : '');
    setIconUrl(selectedWizard ? selectedWizard.iconUrl : '');
    setStepNumber('');
    setStepTitle('');
    setPromptTemplate('');
    setInputs('');
    setType(0);
    setDisplayText('');
    setSaveToContext(false);
    setContextKey('');
    setMarksCompletion(false);
    setUnlocksModules('');
    setSelectedStepId(null);
    setIsFormModified(false);
    initialFormState.current = null;
  };

  const handleSelectWizard = (wizardId: number) => {
    const wizard = wizards.find((w) => w.wizardId === wizardId);
    if (wizard) {
      setSelectedWizardId(wizardId);
      setWizardCode(wizard.wizardCode);
      setIconUrl(wizard.iconUrl);
      fetchWizardSteps(wizardId);
      resetForm();
    }
  };

  const handleSelectStep = (step: WizardStep) => {
    const wizard = wizards.find((w) => w.wizardId === step.wizardId);
    if (wizard) {
      setWizardCode(wizard.wizardCode);
      setIconUrl(wizard.iconUrl);
      setSelectedWizardId(wizard.wizardId);
    }
    setStepNumber(step.stepNumber.toString());
    setStepTitle(step.stepTitle);
    setPromptTemplate(step.promptTemplate);
    setInputs(step.inputs || '');
    setType(step.type as 0 | 1 | 2);
    setDisplayText(step.displayText);
    setSaveToContext(step.saveToContext);
    setContextKey(step.contextKey || '');
    setMarksCompletion(step.marksCompletion);
    setUnlocksModules(step.unlocksModules || '');
    setSelectedStepId(step.stepId);
    initialFormState.current = {
      wizardCode: wizard?.wizardCode || '',
      stepNumber: step.stepNumber.toString(),
      stepTitle: step.stepTitle,
      promptTemplate: step.promptTemplate,
      inputs: step.inputs || '',
      type: step.type,
      displayText: step.displayText,
      saveToContext: step.saveToContext,
      contextKey: step.contextKey || '',
      marksCompletion: step.marksCompletion,
      unlocksModules: step.unlocksModules || '',
    };
    setIsFormModified(false);
  };

  useEffect(() => {
    if (selectedWizardId && !selectedStepId) {
      const maxStepNumber = wizardSteps.length > 0 ? Math.max(...wizardSteps.map((step) => step.stepNumber), 0) : 0;
      setStepNumber((maxStepNumber + 1).toString());
    }
  }, [selectedWizardId, wizardSteps, selectedStepId]);

  useEffect(() => {
    if (selectedStepId && initialFormState.current) {
      const isModified =
        wizardCode !== initialFormState.current.wizardCode ||
        stepNumber !== initialFormState.current.stepNumber ||
        stepTitle !== initialFormState.current.stepTitle ||
        promptTemplate !== initialFormState.current.promptTemplate ||
        inputs !== initialFormState.current.inputs ||
        type !== initialFormState.current.type ||
        displayText !== initialFormState.current.displayText ||
        saveToContext !== initialFormState.current.saveToContext ||
        contextKey !== initialFormState.current.contextKey ||
        marksCompletion !== initialFormState.current.marksCompletion ||
        unlocksModules !== initialFormState.current.unlocksModules;
      setIsFormModified(isModified);
    }
  }, [
    selectedStepId,
    wizardCode,
    stepNumber,
    stepTitle,
    promptTemplate,
    inputs,
    type,
    displayText,
    saveToContext,
    contextKey,
    marksCompletion,
    unlocksModules,
  ]);

  const handleAddWizard = async () => {
    if (!newWizardCode) {
      setError('Wizard Code is required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const wizardResponse = await fetch(`${API.AI_BASE_URL}/wizards`, {
        method: 'POST',
        headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wizardCode: newWizardCode,
          coursePublicId: courseId,
          courseName,
          iconUrl: newIconUrl || '',
        }),
      });
      if (!wizardResponse.ok) {
        const errorData = await wizardResponse.json();
        throw new Error(`Failed to create wizard: ${errorData.error || wizardResponse.status}`);
      }
      const newWizard: Wizard = await wizardResponse.json();
      setWizards((prev) => [...prev, newWizard]);
      setSelectedWizardId(newWizard.wizardId);
      setWizardCode(newWizard.wizardCode);
      setIconUrl(newWizard.iconUrl);
      await fetchWizardSteps(newWizard.wizardId);
      setNewWizardCode('');
      setNewIconUrl('');
      setIsAddingWizard(false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error creating wizard: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelAddWizard = () => {
    setNewWizardCode('');
    setNewIconUrl('');
    setIsAddingWizard(false);
    setError(null);
  };

  const handleSaveWizardEdit = async (wizardId: number) => {
    if (!editedWizardCode) {
      setError('Wizard Code is required');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const wizardResponse = await fetch(
        `${API.AI_BASE_URL}/wizards/${wizardId}`,
        {
          method: 'PUT',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wizardCode: editedWizardCode,
            coursePublicId: courseId,
            courseName,
            iconUrl: editedIconUrl || '',
          }),
        }
      );
      if (!wizardResponse.ok) {
        const errorData = await wizardResponse.json();
        throw new Error(`Failed to update wizard: ${errorData.error || wizardResponse.status}`);
      }
      const updatedWizard: Wizard = await wizardResponse.json();
      setWizards((prev) =>
        prev.map((w) => (w.wizardId === wizardId ? updatedWizard : w))
      );
      setWizardCode(editedWizardCode);
      setIconUrl(editedIconUrl);
      setIsEditingWizard(null);
      setEditedWizardCode('');
      setEditedIconUrl('');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error updating wizard: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelWizardEdit = (wizardId: number) => {
    const wizard = wizards.find((w) => w.wizardId === wizardId);
    if (wizard) {
      setEditedWizardCode(wizard.wizardCode);
      setEditedIconUrl(wizard.iconUrl);
    }
    setIsEditingWizard(null);
  };

  const handleDeleteWizard = async (wizardId: number) => {
    setIsSaving(true);
    setError(null);
    try {
      // --- NEW: LOGIC TO DELETE STORED DATA BEFORE DELETING WIZARD ---
      const storedDataRes = await fetch(`${API.AI_BASE_URL}/stored-wizard-data/by-wizard/${wizardId}`,{headers: API.authHeaders()});
      if (storedDataRes.ok) {
        const storedDataToDelete: StoredWizardData[] = await storedDataRes.json();
        if (storedDataToDelete.length > 0) {
          const deletePromises = storedDataToDelete.map(entry =>
            fetch(`${API.AI_BASE_URL}/stored-wizard-data/${entry.id}`, { method: 'DELETE' })
          );
          await Promise.all(deletePromises);
        }
      }
      // --- END OF NEW LOGIC ---

      const response = await fetch(
        `${API.AI_BASE_URL}/wizards/${wizardId}`,
        {
          method: 'DELETE',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to delete wizard`);
      }
      setWizards((prev) => prev.filter((w) => w.wizardId !== wizardId));
      if (selectedWizardId === wizardId) {
        setSelectedWizardId(null);
        setWizardCode('');
        setIconUrl('');
        setWizardSteps([]);
        resetForm();
      }
      if (wizards.length > 1) {
        const firstWizard = wizards.find((w) => w.wizardId !== wizardId);
        if (firstWizard) {
          setSelectedWizardId(firstWizard.wizardId);
          setWizardCode(firstWizard.wizardCode);
          setIconUrl(firstWizard.iconUrl);
          await fetchWizardSteps(firstWizard.wizardId);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error deleting wizard: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStep = async (stepId: number) => {
    setIsSaving(true);
    setError(null);
    try {
      // --- NEW: LOGIC TO DELETE STORED DATA BEFORE DELETING STEP ---
      const stepToDelete = wizardSteps.find(step => step.stepId === stepId);
      if (stepToDelete && stepToDelete.contextKey) {
          const storedDataRes = await fetch(`${API.AI_BASE_URL}/stored-wizard-data/by-wizard/${stepToDelete.wizardId}`,{headers: API.authHeaders()});
          if (storedDataRes.ok) {
              const allWizardData: StoredWizardData[] = await storedDataRes.json();
              const entriesToDelete = allWizardData.filter(entry => entry.question === stepToDelete.contextKey);
              if (entriesToDelete.length > 0) {
                  const deletePromises = entriesToDelete.map(entry =>
                      fetch(`${API.AI_BASE_URL}/stored-wizard-data/${entry.id}`, { method: 'DELETE' })
                  );
                  await Promise.all(deletePromises);
              }
          }
      }
      // --- END OF NEW LOGIC ---

      const response = await fetch(
        `${API.AI_BASE_URL}/wizard-steps/${stepId}`,
        {
          method: 'DELETE',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: Failed to delete step`);
      }
      setWizardSteps((prev) => prev.filter((step) => step.stepId !== stepId));
      setSelectedStepId(null);
      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error deleting step: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!selectedWizardId || !wizardCode || !stepNumber || !stepTitle) {
      setError('Please fill all required fields');
      return;
    }
    if (type === 1 && !displayText) {
      setError('Display Text is required for Display type');
      return;
    }
    if (type === 0 && !promptTemplate) {
      setError('Prompt Template is required for Prompt type');
      return;
    }
    const stepNum = parseInt(stepNumber, 10);
    if (isNaN(stepNum) || stepNum <= 0) {
      setError('Step Number must be a positive integer');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      let wizardId = selectedWizardId;
      let newStep: WizardStep | null = null;
      
      const stepPayload = {
        wizardId,
        stepNumber: stepNum,
        stepTitle,
        promptTemplate: type === 0 ? promptTemplate : '',
        inputs: (type === 0 || type === 2) ? (inputs || null) : null,
        type,
        displayText: type === 1 ? displayText : '',
        saveToContext: (type === 0 || type === 2) ? saveToContext : false,
        contextKey: (type === 0 || type === 2) ? (contextKey || null) : null,
        marksCompletion: (type === 0 || type === 2) ? marksCompletion : false,
        unlocksModules: (type === 0 || type === 2) ? (unlocksModules || null) : null,
      };

      if (selectedStepId) {
        const stepResponse = await fetch(
          `${API.AI_BASE_URL}/wizard-steps/${selectedStepId}`,
          {
            method: 'PUT',
            headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(stepPayload),
          }
        );
        if (!stepResponse.ok) {
          const errorData = await stepResponse.json();
          throw new Error(`Failed to update step: ${errorData.error || stepResponse.status}`);
        }
        newStep = await stepResponse.json();
      } else {
        const stepResponse = await fetch(`${API.AI_BASE_URL}/wizard-steps`, {
          method: 'POST',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(stepPayload),
        });
        if (!stepResponse.ok) {
          const errorData = await stepResponse.json();
          throw new Error(`Failed to create step: ${errorData.error || stepResponse.status}`);
        }
        newStep = await stepResponse.json();
      }

      if (newStep && wizardId) {
        setWizardSteps((prev) => {
          const updatedSteps = selectedStepId
            ? prev.map((step) => (step.stepId === newStep!.stepId ? newStep! : step))
            : [...prev, newStep!];
          return updatedSteps.sort((a, b) => a.stepNumber - b.stepNumber);
        });
      } else if (wizardId) {
        await fetchWizardSteps(wizardId);
      }

      resetForm();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error saving step: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewStep = () => {
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

  return (
    <View
      style={[
        styles.content,
        isMobile && styles.contentMobile,
        isTablet && styles.contentTablet,
      ]}
    >
      <View style={[styles.leftSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>Wizards for {courseName || 'Course'}</Text>
        <View style={styles.divider} />
        {isWizardsLoading ? (
          <ActivityIndicator size="small" color="#FAFAFB" />
        ) : wizards.length === 0 && !isAddingWizard ? (
          <TouchableOpacity
            style={styles.wizardBox}
            onPress={() => setIsAddingWizard(true)}
          >
            <CustomIcon name="plus" size={24} color="#888" />
            <Text style={styles.wizardCode}>Add New Wizard</Text>
          </TouchableOpacity>
        ) : (
          <FlatList
            data={wizards}
            keyExtractor={(item) => `${item.wizardId}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.wizardContainer}>
                <TouchableOpacity
                  style={[
                    styles.wizardBox,
                    selectedWizardId === item.wizardId && styles.selectedWizardBox,
                  ]}
                  onPress={() => handleSelectWizard(item.wizardId)}
                  activeOpacity={0.7}
                >
                  <CustomIcon
                    name="apps"
                    size={24}
                    color={selectedWizardId === item.wizardId ? '#D22A38' : '#888'}
                  />
                  <View style={styles.wizardTextContainer}>
                    <Text style={styles.wizardCode}>
                      {isEditingWizard === item.wizardId ? (
                        <View style={styles.editContainer}>
                          <TextInput
                            style={[styles.editInput, styles.wizardCodeInput]}
                            value={editedWizardCode}
                            onChangeText={setEditedWizardCode}
                            autoFocus
                          />
                          <TextInput
                            style={[styles.editInput, styles.iconUrlInput]}
                            value={editedIconUrl}
                            onChangeText={setEditedIconUrl}
                            placeholder="Icon URL"
                            placeholderTextColor="#888"
                          />
                        </View>
                      ) : (
                        <Text>{item.wizardCode}</Text>
                      )}
                    </Text>
                    {!isEditingWizard && item.iconUrl && (
                      <Text style={styles.iconUrlText} numberOfLines={1}>
                        {item.iconUrl.length > 20 ? `${item.iconUrl.substring(0, 20)}...` : item.iconUrl}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
                <View style={styles.wizardIcons}>
                  {isEditingWizard === item.wizardId ? (
                    <>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleSaveWizardEdit(item.wizardId)}
                      >
                        <CustomIcon name="check-circle" size={16} color="#D22A38" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => handleCancelWizardEdit(item.wizardId)}
                      >
                        <CustomIcon name="close" size={16} color="#888" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionIcon}
                        onPress={() => {
                          handleDeleteWizard(item.wizardId);
                          setIsEditingWizard(null);
                        }}
                      >
                        <CustomIcon name="trash" size={16} color="#D22A38" />
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      style={styles.editIcon}
                      onPress={() => {
                        setIsEditingWizard(item.wizardId);
                        setEditedWizardCode(item.wizardCode);
                        setEditedIconUrl(item.iconUrl);
                      }}
                    >
                      <CustomIcon name="edit" size={16} color="#888" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
            ListFooterComponent={
              <>
                {isAddingWizard ? (
                  <View style={styles.wizardBox}>
                    <TextInput
                      style={styles.wizardInput}
                      value={newWizardCode}
                      onChangeText={setNewWizardCode}
                      placeholder="Enter Wizard Code"
                      placeholderTextColor="#888"
                      autoFocus
                    />
                    <TextInput
                      style={[styles.wizardInput, styles.iconUrlInput]}
                      value={newIconUrl}
                      onChangeText={setNewIconUrl}
                      placeholder="Icon URL"
                      placeholderTextColor="#888"
                    />
                    <View style={styles.wizardActions}>
                      <TouchableOpacity onPress={handleAddWizard} style={styles.actionIcon}>
                        <CustomIcon name="check-circle" size={24} color="#D22A38" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCancelAddWizard} style={styles.actionIcon}>
                        <CustomIcon name="close" size={24} color="#888" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.wizardBox}
                    onPress={() => setIsAddingWizard(true)}
                  >
                    <CustomIcon name="plus" size={24} color="#888" />
                    <Text style={styles.wizardCode}>Add New Wizard</Text>
                  </TouchableOpacity>
                )}
              </>
            }
          />
        )}
      </View>

      <View style={[styles.middleSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>
          {selectedStepId ? 'Edit Step' : 'Create New Step'}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        {!selectedWizardId && (
          <Text style={styles.emptyText}>Select a wizard to create or edit steps</Text>
        )}
        {selectedWizardId && (
          <ScrollView style={styles.formScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Wizard Code</Text>
                <TextInput
                  style={styles.input}
                  value={wizardCode}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Step Number</Text>
                <TextInput
                  style={styles.input}
                  value={stepNumber}
                  editable={false}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Step Title</Text>
                <TextInput
                  style={styles.input}
                  value={stepTitle}
                  onChangeText={setStepTitle}
                  placeholder="e.g., Generate Instagram Bio"
                  placeholderTextColor="#888"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <SegmentedButtons
                  value={type === 0 ? 'prompt' : type === 1 ? 'display' : 'input'}
                  onValueChange={(value) => {
                    if (value === 'prompt') setType(0);
                    else if (value === 'display') setType(1);
                    else if (value === 'input') setType(2);
                  }}
                  buttons={[
                    { value: 'prompt', label: 'Options' },
                    { value: 'display', label: 'Display' },
                    { value: 'input', label: 'Input' },
                  ]}
                  style={styles.segmentedButtons}
                  theme={{ colors: { secondaryContainer: '#333', onSecondaryContainer: '#FAFAFB' } }}
                />
              </View>

              {type === 1 ? (
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Display Text</Text>
                  <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={displayText}
                    onChangeText={setDisplayText}
                    multiline
                    numberOfLines={6}
  placeholder={`e.g., \n"directDisplay": "Thanks for filling this."\n"prompt": "Write a detailed guide on how to create a successful Instagram bio. (dev: AI will generate the bio based on this guide.)"`}
                    placeholderTextColor="#888"
                  />
                </View>
              ) : (
                <>
                  {type === 0 && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Prompt Template</Text>
                      <TextInput
                        style={[styles.input, styles.multilineInput]}
                        value={promptTemplate}
                        onChangeText={setPromptTemplate}
                        multiline
                        numberOfLines={5}
                        placeholder="e.g., Show top 20 niches for upcoming Business Trends (dev: AI will generate the top 20 niches based on this prompt, remember to use top _num_ )"
                        placeholderTextColor="#888"
                      />
                    </View>
                  )}
                  
                  <View style={styles.switchGroup}>
                    <Text style={styles.inputLabel}>Save to Context</Text>
                    <Switch
                      value={saveToContext}
                      onValueChange={setSaveToContext}
                      trackColor={{ false: '#888', true: '#D22A38' }}
                      thumbColor="#FAFAFB"
                    />
                  </View>
                  {saveToContext && (
                    <View style={styles.inputGroup}>
                      <Text style={styles.inputLabel}>Context Key</Text>
                      <TextInput
                        style={styles.input}
                        value={contextKey}
                        onChangeText={setContextKey}
                        placeholder="e.g., bio_text"
                        placeholderTextColor="#888"
                      />
                    </View>
                  )}
                </>
              )}
            </View>
          </ScrollView>
        )}
        {selectedWizardId && (
          <View style={styles.formActions}>
            <Button
              mode="contained"
              onPress={handleSave}
              disabled={
                isSaving ||
                !selectedWizardId ||
                !stepTitle ||
                (type === 0 && !promptTemplate) ||
                (type === 1 && !displayText) ||
                (selectedStepId && !isFormModified) ||
                !wizardCode ||
                !stepNumber
              }
              style={[
                styles.saveButton,
                (
                  !stepTitle ||
                  (type === 0 && !promptTemplate) ||
                  (type === 1 && !displayText) ||
                  (selectedStepId && !isFormModified)
                ) && styles.disabledButton
              ]}
              labelStyle={styles.buttonLabel}
            >
              {isSaving ? <ActivityIndicator size="small" color="#FAFAFB" /> : 'Save'}
            </Button>
            {selectedStepId && (
              <Button
                mode="outlined"
                onPress={() => handleDeleteStep(selectedStepId)}
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
        )}
      </View>

      <View style={[styles.rightSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>
          Steps for {wizards.find((w) => w.wizardId === selectedWizardId)?.wizardCode || 'Wizard'}
        </Text>
        {isStepsLoading ? (
          <ActivityIndicator size="small" color="#FAFAFB" />
        ) : !selectedWizardId ? (
          <Text style={styles.emptyText}>Select a wizard to view steps</Text>
        ) : wizardSteps.length === 0 ? (
          <Text style={styles.emptyText}>
            {error ? error : `No steps found for this wizard`}
          </Text>
        ) : (
          <FlatList
            data={wizardSteps.sort((a, b) => a.stepNumber - b.stepNumber)}
            keyExtractor={(item) => `${item.stepId}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity onPress={() => handleSelectStep(item)}>
                <View
                  style={[
                    styles.stepCard,
                    selectedStepId === item.stepId && styles.selectedStepCard,
                  ]}
                >
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>{item.stepTitle}</Text>
                    <View style={styles.stepTag}>
                      <Text style={styles.stepTagText}>Step {item.stepNumber}</Text>
                    </View>
                  </View>
                  <Text style={styles.stepDetails}>
                    Wizard: {wizards.find((w) => w.wizardId === item.wizardId)?.wizardCode || 'Unknown'} | Type: {item.type === 0 ? 'Prompt' : item.type === 1 ? 'Display' : 'Input'} |{' '}
                    {item.type === 0
                      ? `Prompt: ${item.promptTemplate?.substring(0, 20) || 'No prompt'}${item.promptTemplate?.length > 20 ? '...' : ''}`
                      : item.type === 1
                        ? `Display: ${item.displayText?.substring(0, 20) || 'No display text'}${item.displayText?.length > 20 ? '...' : ''}`
                        : `Context Key: ${item.contextKey || 'Not set'}`
                    }
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
        {selectedWizardId && (
          <View style={styles.addNewContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              <TouchableOpacity style={styles.addNewButton} onPress={handleAddNewStep}>
                <CustomIcon name="plus" size={20} color="#FAFAFB" />
              </TouchableOpacity>
            </Animated.View>
            {showTooltip && (
              <View style={styles.tooltip}>
                <Text style={styles.tooltipText}>Add New Step</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    flexDirection: 'row',
    padding: moderateScale(8),
    height: moderateScale(400),
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
  sectionLabel: {
    color: '#FAFAFB',
    fontSize: moderateScale(12),
    fontWeight: '500',
    marginBottom: moderateScale(4),
  },
  divider: {
    height: 1,
    backgroundColor: '#3D3D46',
    marginVertical: moderateScale(4),
  },
  wizardContainer: {
    position: 'relative',
    marginBottom: moderateScale(8),
  },
  wizardBox: {
    width: '100%',
    height: moderateScale(90),
    backgroundColor: '#252525',
    borderRadius: moderateScale(8),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: moderateScale(8),
    borderWidth: 1,
    borderColor: '#3D3D46',
  },
  selectedWizardBox: {
    borderColor: '#D22A38',
    backgroundColor: '#2A2A2A',
  },
  wizardTextContainer: {
    alignItems: 'center',
    paddingVertical: moderateScale(4),
  },
  wizardCode: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
    fontWeight: '500',
    textAlign: 'center',
  },
  editContainer: {
    width: '90%',
    alignItems: 'center',
  },
  editInput: {
    backgroundColor: '#333',
    color: '#FAFAFB',
    padding: moderateScale(4),
    borderRadius: moderateScale(4),
    fontSize: moderateScale(10),
    textAlign: 'center',
    borderColor: '#D22A38',
    borderWidth: 1,
    marginBottom: moderateScale(4),
  },
  wizardCodeInput: {
    width: '100%',
  },
  iconUrlInput: {
    width: '100%',
    fontSize: moderateScale(8),
  },
  iconUrlText: {
    color: '#888',
    fontSize: moderateScale(8),
    marginTop: moderateScale(2),
    textAlign: 'center',
  },
  wizardIcons: {
    position: 'absolute',
    bottom: moderateScale(8),
    right: moderateScale(8),
    flexDirection: 'row',
    gap: moderateScale(4),
  },
  editIcon: {
    padding: moderateScale(4),
  },
  actionIcon: {
    padding: moderateScale(4),
  },
  wizardInput: {
    backgroundColor: '#333',
    color: '#FAFAFB',
    padding: moderateScale(6),
    borderRadius: moderateScale(4),
    fontSize: moderateScale(10),
    width: '80%',
    textAlign: 'center',
    marginBottom: moderateScale(4),
  },
  wizardActions: {
    flexDirection: 'row',
    gap: moderateScale(8),
    marginTop: moderateScale(4),
    justifyContent: 'center',
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
    marginBottom: moderateScale(8),
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
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(8),
  },
  segmentedButtons: {
    width: '100%',
  },
  segmentedButton: {
    backgroundColor: '#333',
    borderRadius: moderateScale(4),
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
    padding: moderateScale(4),
    marginBottom: moderateScale(4),
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScale(2),
  },
  stepTag: {
    backgroundColor: '#4A4A4A',
    borderRadius: moderateScale(8),
    paddingHorizontal: moderateScale(4),
    paddingVertical: moderateScale(1),
  },
  stepTagText: {
    color: '#E5E5E5',
    fontSize: moderateScale(8),
    fontWeight: '500',
  },
  stepTitle: {
    color: '#FAFAFB',
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  stepDetails: {
    color: '#888',
    fontSize: moderateScale(9),
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: moderateScale(3),
    elevation: 5,
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
});