import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Button, ActivityIndicator } from 'react-native-paper';
import { moderateScale } from 'react-native-size-matters';
import { Picker } from '@react-native-picker/picker';
import { API } from '@/api/api';

interface Prompt {
  id: number;
  coursePublicId: string;
  type: 'Objections' | 'Steps';
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

interface PromptSettingsProps {
  courseName: string;
  courseId: string;
}

export default function PromptSettings({ courseName, courseId }: PromptSettingsProps) {
  const [selectedType, setSelectedType] = useState<'Objections' | 'Steps'>('Objections');
  const [promptText, setPromptText] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [prompts, setPrompts] = useState<{ Objections?: Prompt; Steps?: Prompt }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormModified, setIsFormModified] = useState(false);
  const initialFormState = useRef<{
    type: 'Objections' | 'Steps';
    prompt: string;
  } | null>(null);

  const { width } = Dimensions.get('window');
  const isMobile = width < 600;
  const isTablet = width >= 600 && width < 900;

  useEffect(() => {
    fetchPrompts();
  }, [courseId]);

  useEffect(() => {
    // Load prompt text when type changes
    const currentPrompt = prompts[selectedType];
    if (currentPrompt) {
      setPromptText(currentPrompt.prompt);
      initialFormState.current = { type: selectedType, prompt: currentPrompt.prompt };
    } else {
      setPromptText('');
      initialFormState.current = { type: selectedType, prompt: '' };
    }
    setIsFormModified(false);
  }, [selectedType, prompts]);

  useEffect(() => {
    if (initialFormState.current) {
      const isModified = promptText !== initialFormState.current.prompt;
      setIsFormModified(isModified);
    }
  }, [promptText]);

  const fetchPrompts = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/prompts/by-course/${courseId}`,
        {
          method: 'GET',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}: Failed to fetch prompts`);
      const data: Prompt[] = await response.json();
      // Organize prompts by type
      const promptMap: { Objections?: Prompt; Steps?: Prompt } = {};
      data.forEach((prompt) => {
        if (prompt.type === 'Objections' || prompt.type === 'Steps') {
          promptMap[prompt.type] = prompt;
        }
      });
      setPrompts(promptMap);
      // Set initial prompt text for the default type
      const initialPrompt = promptMap[selectedType];
      if (initialPrompt) {
        setPromptText(initialPrompt.prompt);
        initialFormState.current = { type: selectedType, prompt: initialPrompt.prompt };
      } else {
        setPromptText('');
        initialFormState.current = { type: selectedType, prompt: '' };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error fetching prompts: ${errorMessage}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!promptText) {
      setError('Please enter a prompt');
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      const payload = {
        coursePublicId: courseId,
        type: selectedType,
        prompt: promptText,
      };

      const existingPrompt = prompts[selectedType];
      if (existingPrompt) {
        // Update existing prompt
        const response = await fetch(
          `${API.AI_BASE_URL}/prompts/${existingPrompt.id}`,
          {
            method: 'PUT',
            headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) throw new Error(`HTTP error ${response.status}: Failed to update prompt`);
      } else {
        // Create new prompt
        const response = await fetch(
          `${API.AI_BASE_URL}/prompts`,
          {
            method: 'POST',
            headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        );
        if (!response.ok) throw new Error(`HTTP error ${response.status}: Failed to create prompt`);
      }

      await fetchPrompts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error saving prompt: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const existingPrompt = prompts[selectedType];
    if (!existingPrompt) return;
    setIsSaving(true);
    setError(null);
    try {
      const response = await fetch(
        `${API.AI_BASE_URL}/prompts/${existingPrompt.id}`,
        {
          method: 'DELETE',
          headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
        }
      );
      if (!response.ok) throw new Error(`HTTP error ${response.status}: Failed to delete prompt`);
      await fetchPrompts();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Error deleting prompt: ${errorMessage}`);
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View
      style={[
        styles.content,
        isMobile && styles.contentMobile,
        isTablet && styles.contentTablet,
      ]}
    >
      <View style={[styles.mainSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>
          {prompts[selectedType] ? 'Edit Prompt' : 'Create Prompt'}
        </Text>
        {error && <Text style={styles.errorText}>{error}</Text>}
        <ScrollView style={styles.formScroll}>
          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prompt Type</Text>
              <Picker
                selectedValue={selectedType}
                onValueChange={(itemValue) => setSelectedType(itemValue)}
                style={styles.picker}
              >
                <Picker.Item label="Objections" value="Objections" />
                <Picker.Item label="Steps" value="Steps" />
              </Picker>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Prompt Text</Text>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={promptText}
                onChangeText={setPromptText}
                multiline
                numberOfLines={4}
                placeholder={`e.g., ${selectedType === 'Objections' ? 'Describe how to handle customer objections for this course' : 'Outline the steps to complete this course'}`}
                placeholderTextColor="#888"
              />
            </View>
          </View>
        </ScrollView>
        <View style={styles.formActions}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={isSaving || !promptText || (prompts[selectedType] && !isFormModified)}
            style={[styles.saveButton, prompts[selectedType] && !isFormModified ? styles.disabledButton : null]}
            labelStyle={styles.buttonLabel}
          >
            {isSaving ? <ActivityIndicator size="small" color="#FAFAFB" /> : 'Save'}
          </Button>
          {prompts[selectedType] && (
            <Button
              mode="outlined"
              onPress={handleDelete}
              style={styles.deleteButton}
              labelStyle={styles.buttonLabel}
              theme={{ colors: { outline: '#D22A38' } }}
            >
              Delete
            </Button>
          )}
        </View>
      </View>

      <View style={[styles.rightSection, isMobile && styles.sectionMobile]}>
        <Text style={styles.sectionLabel}>Prompts for {courseName}</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#FAFAFB" />
        ) : (
          <View>
            <View style={styles.promptCard}>
              <Text style={styles.promptTitle}>Objections</Text>
              <Text style={styles.promptDetails}>
                {prompts.Objections
                  ? prompts.Objections.prompt.length > 20
                    ? `${prompts.Objections.prompt.substring(0, 20)}...`
                    : prompts.Objections.prompt
                  : 'No prompt set'}
              </Text>
            </View>
            <View style={styles.promptCard}>
              <Text style={styles.promptTitle}>Steps</Text>
              <Text style={styles.promptDetails}>
                {prompts.Steps
                  ? prompts.Steps.prompt.length > 20
                    ? `${prompts.Steps.prompt.substring(0, 20)}...`
                    : prompts.Steps.prompt
                  : 'No prompt set'}
              </Text>
            </View>
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
    height: moderateScale(250),
  },
  contentMobile: {
    flexDirection: 'column',
    height: 'auto',
  },
  contentTablet: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  mainSection: {
    flex: 2,
    paddingHorizontal: moderateScale(8),
    borderRightWidth: 1,
    borderColor: '#3D3D46',
  },
  sectionMobile: {
    paddingRight: 0,
    marginBottom: moderateScale(8),
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
    minHeight: moderateScale(80),
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
  buttonLabel: {
    color: '#FAFAFB',
    fontSize: moderateScale(10),
  },
  rightSection: {
    flex: 1,
    paddingLeft: moderateScale(8),
  },
  promptCard: {
    backgroundColor: '#252525',
    borderRadius: moderateScale(4),
    padding: moderateScale(6),
    marginBottom: moderateScale(4),
  },
  promptTitle: {
    color: '#FAFAFB',
    fontSize: moderateScale(11),
    fontWeight: '500',
  },
  promptDetails: {
    color: '#888',
    fontSize: moderateScale(10),
  },
});