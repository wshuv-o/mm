import axios from 'axios';
import { API } from './api';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface WizardData {
  id: number;
  wizardId: number;
  studentPublicId: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  coursePublicId: string;
}

interface Message {
  role: 'bot' | 'user';
  content: string;
}

interface ObjectionOnlyResponse {
  generatedText: string;
}

// const DEEPSEEK_API_URL = 'https://api.openai.com/v1/chat/completions';

const WIZARD_DATA_API_URL = `${API.AI_BASE_URL}/stored-wizard-data/by-student`;
const PROMPT_API_URL = `${API.AI_BASE_URL}/prompts/by-course`;

async function fetchWizardContext(studentPublicId: string, coursePublicId: string): Promise<string> {
  console.log(`Fetching wizard data for studentPublicId: ${studentPublicId}, coursePublicId: ${coursePublicId}`);
  try {
    const wizardDataResponse = await fetch(`${WIZARD_DATA_API_URL}/${studentPublicId}`, {
      method: 'GET',
      headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
    });
    console.log(`Wizard data API response status: ${wizardDataResponse.status}`);
    if (!wizardDataResponse.ok) {
      console.error(`Failed to fetch wizard data: HTTP ${wizardDataResponse.status}`);
      throw new Error(`Failed to fetch wizard data: HTTP ${wizardDataResponse.status}`);
    }
    const wizardData: WizardData[] = await wizardDataResponse.json();
    console.log('Raw wizard data response:', wizardData);

    const relevantWizardData = wizardData.filter(data => data.coursePublicId === coursePublicId);
    console.log(`Filtered wizard data for coursePublicId ${coursePublicId}:`, relevantWizardData);

    if (relevantWizardData.length === 0) {
      console.warn(`No wizard data found for student ${studentPublicId} and course ${coursePublicId}`);
      return 'No relevant student data available for this course.';
    }

    const context = relevantWizardData
      .map(data => `Question: ${data.question}\nAnswer: ${data.answer}`)
      .join('\n\n');
    console.log('Formatted wizard context:', context);
    return context;
  } catch (error) {
    console.error('Error fetching wizard data:', error);
    return 'Error fetching student data. Please try again later.';
  }
}

async function fetchObjectionPrompt(coursePublicId: string): Promise<string> {
  console.log(`Fetching objection prompt for coursePublicId: ${coursePublicId}`);
  try {
  const promptResponse = await fetch(`${PROMPT_API_URL}/${coursePublicId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...API.authHeaders(),
    },
  });

    console.log(`Prompt API response status: ${promptResponse.status}`);
    if (!promptResponse.ok) {
      console.error(`Failed to fetch prompt data: HTTP ${promptResponse.status}`);
      throw new Error(`Failed to fetch prompt data: HTTP ${promptResponse.status}`);
    }
    const promptData: any[] = await promptResponse.json();
    console.log('Raw prompt data response:', promptData);

    const objectionPrompt = promptData.find(data => data.type === 'Objections')?.prompt;
    if (!objectionPrompt) {
      console.warn(`No objection prompt found for course ${coursePublicId}`);
      return 'Default objection handling: Generate a response based on the user objection, using conversation history as context.';
    }

    console.log('Fetched objection prompt:', objectionPrompt);
    return objectionPrompt;
  } catch (error) {
    console.error('Error fetching objection prompt:', error);
    return 'Default objection handling: Generate a response based on the user objection, using conversation history as context.';
  }
}

export async function generateObjectionOnly(
  studentPublicId: string,
  objection: string,
  coursePublicId: string,
  prevMessages: Message[] | null = null
): Promise<ObjectionOnlyResponse> {
  console.log('Starting generateObjectionOnly with parameters:', {
    studentPublicId,
    objection,
    coursePublicId,
    prevMessages,
  });

  try {
    const wizardContext = await fetchWizardContext(studentPublicId, coursePublicId);
    console.log('Fetched wizard context:', wizardContext);

    const objectionPrompt = await fetchObjectionPrompt(coursePublicId);
    console.log('Fetched objection prompt:', objectionPrompt);

    // let systemPrompt = `You are an expert to address user objections. Use the following student data (if seems/needs to usable then use) as context to generate a response based on the user's objection. And there going to be an Instraction (try to follow that Instraction).  And dont ask followup questions as its not a chat-system, just generate the content what mentioned(ex: llms asks questions or talks to user at the end, dont do this). \n\nStudent Data:\n${wizardContext}\n\n`;

    let systemPrompt = `You are an expert to address user objections. Use the following student data (if seems/needs to usable then use) as context to generate a response based on the user's objection. And there going to be an Instraction (try to follow that Instraction).  And dont ask followup questions as its not a chat-system, just generate the content what mentioned(ex: llms asks questions or talks to user at the end, dont do this). `;

    if (prevMessages && prevMessages.length > 0) {
      const context = prevMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
      systemPrompt += `Conversation History:\n${context}\n\n`;
      console.log('Added conversation history to system prompt:', context);
    }

    systemPrompt += `User Objection: ${objection}\n\nInstructions: ${objectionPrompt}`;
    console.log('Final system prompt:', systemPrompt);

    const messages = [
      { role: 'system', content: systemPrompt },
      ...((prevMessages ?? []).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      }))),
      { role: 'user', content: objection },
    ];
    console.log('Messages sent to DeepSeek:', messages);

    // const response = await axios.post<DeepSeekResponse>(
    //   DEEPSEEK_API_URL,
    //   {
    //     model: 'gpt-4o-mini',
    //     messages,
    //     stream: false,
    //   },
    //   {
    //     headers: {
    //       'Content-Type': 'application/json',
    //       'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
    //     },
    //   }
    // );

    const response = await axios.post('https://app.ceosociety.io/api/deepseek', {
          messages
        },
      {
        headers: API.authHeaders(), // Bearer token here
      }
    );

    console.log('DeepSeek API response:', response.data);
    const generatedText = response.data.choices[0].message.content;
    console.log('Extracted generated text:', generatedText);

    return { generatedText };
  } catch (error) {
    console.error('Error generating objection-only response:', error);
    return { generatedText: 'Error generating response. Please try again later.' };
  }
}