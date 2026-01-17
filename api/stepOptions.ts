// G:\finishing\ceo_ai_frontend\api\stepOptions.ts

import axios from 'axios';
import { API } from './api';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface StepOption {
  label: string;
  value: string;
}

interface StepOptionsResponse {
  items: StepOption[];
}

interface WizardStep {
  stepId: number;
  wizardId: number;
  stepNumber: number;
  stepTitle: string;
  promptTemplate: string;
  inputs: string | null;
  saveToContext: number;
  contextKey: string | null;
  marksCompletion: number;
  unlocksModules: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AnswerHistory {
  stepId: number;
  title: string;
  selectedOption: string;
}

const DEEPSEEK_API_URL = 'https://api.openai.com/v1/chat/completions';


function extractAndParseJSON(markdownString: string): StepOptionsResponse | null {
  try {
    const match = markdownString.match(/```json\s*([\s\S]*?)\s*```/);
    if (!match || match.length < 2) {
      // Fallback for cases where AI doesn't use markdown block
      const jsonStartIndex = markdownString.indexOf('{');
      const jsonEndIndex = markdownString.lastIndexOf('}');
      if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
        const rawJSON = markdownString.substring(jsonStartIndex, jsonEndIndex + 1);
        return JSON.parse(rawJSON);
      }
      throw new Error('No valid JSON block found');
    }
    const rawJSON = match[1].replace(/\\"/g, '"').replace(/\\n/g, '\n').trim();
    return JSON.parse(rawJSON);
  } catch (error) {
    console.error('❌ Failed to extract or parse JSON:', error);
    return null;
  }
}

function extractExactOptionCount(prompt: string): number {
  const exactMatch = prompt.match(/(?:exactly|top|give)\s+(\d+)\b/i);
  if (exactMatch && exactMatch[1]) {
    return parseInt(exactMatch[1], 10);
  }
  const generalMatch = prompt.match(/(\d+)\s*(?:best|top|options)\b/i);
  if (generalMatch && generalMatch[1]) {
    return parseInt(generalMatch[1], 10);
  }
  return 5;
}

// --- REMOVED --- The restrictive promptMentionsContext function is no longer needed.

export async function getStepOptions(step: WizardStep, answerHistory: AnswerHistory[]): Promise<StepOptionsResponse> {
  let optionCount = extractExactOptionCount(step.promptTemplate);
  optionCount = Math.min(optionCount, 50);

  console.log('📋 Parsed optionCount:', optionCount);
  console.log('📜 Answer history being sent to AI:', answerHistory);

  const context = answerHistory
    .map((answer) => `- For the question "${answer.title}", the user selected: "${answer.selectedOption}"`)
    .join('\n');

  // --- MODIFIED: The system prompt now ALWAYS includes the context ---
  // This allows the AI to use it intelligently without requiring specific keywords in the user prompt.
  const systemPrompt = `You are a helpful assistant. Your task is to generate a list of options for a user based on their request.
You MUST provide the response as a single JSON object wrapped in a markdown block (\`\`\`json).
The JSON object must contain a key named "items", which is an array.
This array must contain exactly ${optionCount} objects, each with a "label" (the user-facing text) and a "value" (a unique identifier, can be the same as the label).
Do not include any additional text, explanation, or conversational filler outside the JSON markdown block.

Use the following "Previously Selected Results" as context to generate more relevant and personalized options.

Previously Selected Results:
${context || 'No previous answers available.'}`;
  // --- END MODIFICATION ---

  console.log('📤 Final system prompt to DeepSeek:\n', systemPrompt);
  console.log('👤 User prompt:\n', step.promptTemplate);

  try {
    // const response = await axios.post<DeepSeekResponse>(
    //   DEEPSEEK_API_URL,
    //   {
    //     model: 'gpt-4o-mini',
    //     messages: [
    //       { role: 'system', content: systemPrompt },
    //       { role: 'user', content: step.promptTemplate },
    //     ],
    //     stream: false,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
    //     },
    //   }
    // );

    
const response = await axios.post(
  'https://app.ceosociety.io/api/deepseek',
  {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: step.promptTemplate },
    ],
  },
  {
    headers: API.authHeaders(),
  }
);




    const content = response.data.choices[0].message.content;
    console.log('📦 Raw API response:', content);

    const parsedOptions = extractAndParseJSON(content);

    if (!parsedOptions || !parsedOptions.items || !Array.isArray(parsedOptions.items)) {
      throw new Error('Invalid format or missing "items" array received from DeepSeek');
    }

    let items = parsedOptions.items.slice(0, optionCount).map((item, index) => ({
      label: item.label || `Option ${index + 1}`,
      value: item.value || `option_${index + 1}`,
    }));

    // This loop is for safety but ideally the AI follows the prompt exactly.
    while (items.length < optionCount) {
      const index = items.length;
      items.push({
        label: `Additional Option ${index + 1}`,
        value: `additional_option_${index + 1}`,
      });
    }

    console.log('✅ Final generated options:', items);
    return { items };
  } catch (error) {
    console.error('🚨 Error fetching step options:', error);
    return {
      items: Array.from({ length: optionCount }, (_, i) => ({
        label: `Fallback Option ${i + 1}`,
        value: `fallback_option_${i + 1}`,
      })),
    };
  }
}