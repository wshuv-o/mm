// G:\finishing\ceo_ai_frontend\api\contentGen.ts
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

interface PromptData {
  id: number;
  coursePublicId: string;
  type: string;
  prompt: string;
  createdAt: string;
  updatedAt: string;
}

interface ContentGenResponse {
  generatedText: string;
}

interface Message {
  role: 'bot' | 'user';
  content: string;
}

interface ContentContext {
  wizardCode: string;
  promptTemplate: string;
  generatedText: string;
}
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
      headers: {...API.authHeaders(), 'Content-Type': 'application/json' },
    });
    console.log(`Prompt API response status: ${promptResponse.status}`);
    if (!promptResponse.ok) {
      console.error(`Failed to fetch prompt data: HTTP ${promptResponse.status}`);
      throw new Error(`Failed to fetch prompt data: HTTP ${promptResponse.status}`);
    }
    const promptData: PromptData[] = await promptResponse.json();
    console.log('Raw prompt data response:', promptData);

    const objectionPrompt = promptData.find(data => data.type === 'Objections')?.prompt;
    if (!objectionPrompt) {
      console.warn(`No objection prompt found for course ${coursePublicId}`);
      return 'Default objection handling: Modify the response based on the user objection while staying true to the original prompt.';
    }

    console.log('Fetched objection prompt:', objectionPrompt);
    return objectionPrompt;
  } catch (error) {
    console.error('Error fetching objection prompt:', error);
    return 'Default objection handling: Modify the response based on the user objection while staying true to the original prompt.';
  }
}

export async function generateContent(
  studentPublicId: string,
  type: string,
  prompt: string,
  prevMessages: Message[] | null = null,
  contentContext: ContentContext | null = null,
  coursePublicId: string
): Promise<ContentGenResponse> {
  console.log('Starting generateContent with parameters:', {
    studentPublicId,
    type,
    prompt,
    prevMessages,
    contentContext,
    coursePublicId,
  });

  try {
    let systemPrompt = '';
    let messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [];

    const wizardContext = await fetchWizardContext(studentPublicId, coursePublicId);
    console.log('Fetched wizard context:', wizardContext);

    if (type === 'objection') {
      console.log('Handling objection case');

      const objectionPrompt = await fetchObjectionPrompt(coursePublicId);
      console.log('Fetched objection prompttttt:', objectionPrompt);
      
      systemPrompt = `You are an expert content generator specializing in refining and addressing user concerns about an initial content piece. The "Initial Context" below includes the original user-provided prompt (promptTemplate) and the first generated response, which are the primary focus of your work. Your role is to address the user's objection by modifying the first generated response, ensuring the output remains aligned with the original promptTemplate. Use the student data and conversation history as secondary context to support your response.\n\n`;

      if (contentContext) {
        systemPrompt += `Initial Context:\nOriginal Prompt (Primary Focus): ${contentContext.promptTemplate}\nFirst Generated Response: ${contentContext.generatedText}\n\n`;
      }

      systemPrompt += `Student Data (Secondary Context):\n${wizardContext}\n\n`;

      if (prevMessages && prevMessages.length > 0) {
        const context = prevMessages.map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`).join('\n');
        systemPrompt += `Conversation History (Secondary Context):\n${context}\n\n`;
      }

      systemPrompt += `User Objection: ${prompt}\n\nInstructions: ${objectionPrompt}\n\n`;
      console.log('Final system prompt for objection:', systemPrompt);

      messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ];
      console.log('Messages sent to DeepSeek (objection):', messages);

    } else {
      // ====================================================================
      // ===== START: REVISED LOGIC FOR NON-OBJECTION CASE              =====
      // ====================================================================
      console.log('Handling non-objection case');

      // 1. Create a Map from the student data for easy lookup.
      const studentDataMap = new Map<string, string>();
      if (wizardContext && !wizardContext.startsWith('Error') && !wizardContext.startsWith('No relevant')) {
        const qaPairs = wizardContext.split('\n\n');
        for (const pair of qaPairs) {
          const lines = pair.split('\n');
          if (lines.length === 2 && lines[0].startsWith('Question: ') && lines[1].startsWith('Answer: ')) {
            const question = lines[0].replace('Question: ', '').trim();
            const answer = lines[1].replace('Answer: ', '').trim();
            studentDataMap.set(question, answer);
          }
        }
      }
      
      // 2. Process the prompt to replace all {context_name} placeholders with real data.
      const processedPrompt = prompt.replace(/{([^}]+)}/g, (match, contextName) => {
        const key = contextName.trim();
        const answer = studentDataMap.get(key);
        if (answer !== undefined) {
          return answer;
        }
        console.warn(`No answer found for placeholder '{${key}}'. Leaving it as is.`);
        return match;
      });
      
      console.log("Original prompt received:", prompt);
      console.log("Final processed prompt sent to AI:", processedPrompt);

      // 3. Construct a simplified system prompt. Since we've already replaced the placeholders,
      // we no longer need to instruct the AI on how to do it.
      systemPrompt = `You are an expert content generator. Generate a **standalone**, **detailed** content piece based strictly on the following prompt. The prompt has already been filled with the necessary user details.\n\nPrompt: ${processedPrompt}\n\nOnly generate the requested content. **Do not ask follow-up questions, do not offer additional help, and do not include any conversational or assistant-like text.** This is not a chat — just return the generated content as a response block.`;
      console.log('Final system prompt for non-objection:', systemPrompt);

      messages = [
        { role: 'system', content: systemPrompt },
        // The user message IS the final, processed prompt. The AI doesn't need the original.
        { role: 'user', content: processedPrompt }, 
      ];
      console.log('Messages sent to DeepSeek (non-objection):', messages);
      // ====================================================================
      // ===== END: REVISED LOGIC FOR NON-OBJECTION CASE                =====
      // ====================================================================
    }

    console.log('Sending request to DeepSeek API...');

    // const response = axios.post('https://app.ceosociety.io/api/deepseek', {
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

      const response = await axios.post(
      'https://app.ceosociety.io/api/deepseek',
      {
        messages,
      },
      {
        headers: API.authHeaders(), // Bearer token here
      }
    );



    console.log('DeepSeek API response received.');
    const generatedText = response.data.choices[0].message.content;
    console.log('Extracted generated text:', generatedText);

    return { generatedText };
  } catch (error) {
    console.error('Error generating content:', error);
    return { generatedText: 'Error generating content. Please try again later.' };
  }
}