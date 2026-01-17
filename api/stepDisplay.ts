// import axios from 'axios';

// interface DeepSeekResponse {
//   choices: Array<{
//     message: {
//       content: string;
//     };
//   }>;
// }

// interface AnswerHistory {
//   stepId: number;
//   title: string;
//   selectedOption: string;
// }

// const DEEPSEEK_API_URL = 'https://api.openai.com/v1/chat/completions';
 
// export async function getStepDisplay(displayText: string | null, answerHistory: AnswerHistory[]): Promise<string> {
//   if (!displayText) {
//     return ''; 
//   }

//   const context = answerHistory
//     .map((answer) => `Step ${answer.stepId}: ${answer.title} -> Selected: ${answer.selectedOption}`)
//     .join('\n');

//  const systemPrompt = `You are generating **display text** based on the provided prompt. Use previously selected results as context if pormpts said to use or point which one in the prompt (and please do not use Previously selected result(psr) if the prompt not mention).  If the prompt includes values meant for direct display (e.g., keywords like "directDisplay" or "original display"), incorporate them exactly or as closely as possible. Otherwise, generate customized text based on the prompt and context.
// **Important:** Do not ask follow-up questions, do not add conversational phrases, and do not act like a chat assistant. Only return the display-ready content.
// \n
// Previously selected result(psr):\n${context || 'No previous answers available.'}`;
// console.log("hiiiiii ==> ", systemPrompt);


//   try {
//     const response = await axios.post<DeepSeekResponse>(
//       DEEPSEEK_API_URL,
//       {
//         model: 'gpt-4o-mini',
//         messages: [
//           { role: 'system', content: systemPrompt },
//           { role: 'user', content: displayText },
//         ],
//         stream: false,
//       },
//       {
//         headers: {
//           'Content-Type': 'application/json',
//           Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
//         },
//       }
//     );

//     const content = response.data.choices[0].message.content;
//     console.log('📦 Raw API response for display text:', content);
//     return content;
//   } catch (error) {
//     console.error('🚨 Error fetching display text:', error);
//     return displayText; 
//   }
// }

// G:\finishing\ceo_ai_frontend\api\stepDisplay.ts

import axios from 'axios';
import { API } from './api';

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface AnswerHistory {
  stepId: number;
  title: string;
  selectedOption: string;
}

const DEEPSEEK_API_URL = 'https://api.openai.com/v1/chat/completions';
 
export async function getStepDisplay(displayText: string | null, answerHistory: AnswerHistory[]): Promise<string> {
  if (!displayText) {
    return ''; 
  }

  const context = answerHistory
    .map((answer) => `- For the question "${answer.title}", the user selected: "${answer.selectedOption}"`)
    .join('\n');

  // --- MODIFIED: Simplified and improved the system prompt for clarity and reliability ---
  const systemPrompt = `You are generating display text for a user inside an application wizard.
Your response should be professional, well-formatted (using markdown where appropriate), and directly address the user's prompt.
Use the provided "Context from Previous Steps" to inform and personalize your response.
**Important:** Do not ask follow-up questions or act like a chat assistant. Only return the final, display-ready content.

Context from Previous Steps:
${context || 'No previous answers available.'}`;
  // --- END MODIFICATION ---

  console.log('📤 Final system prompt to DeepSeek (for display text):\n', systemPrompt);
  console.log('👤 User prompt:\n', displayText);


  try {
    // const response = await axios.post<DeepSeekResponse>(
    //   DEEPSEEK_API_URL,
    //   {
    //     model: 'gpt-4o-mini',
    //     messages: [
    //       { role: 'system', content: systemPrompt },
    //       { role: 'user', content: displayText },
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
    
    const response = await axios.post('https://app.ceosociety.io/api/deepseek', {
             messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: displayText },
        ],
        },
      {
        headers: API.authHeaders(), // Bearer token here
      });



    const content = response.data.choices[0].message.content;
    console.log('📦 Raw API response for display text:', content);
    return content;
  } catch (error) {
    console.error('🚨 Error fetching display text:', error);
    // Return the original prompt as a fallback on error
    return displayText; 
  }
}