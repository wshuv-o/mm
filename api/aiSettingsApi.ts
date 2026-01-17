// // E:\Coding Practice\client\ceo_ai_frontend\api\aiSettings.ts
// import { API } from './api';  // This is your initialized Axios instance

// export interface AISetting {
//   id?: number;
//   wizard_id: string;
//   step_number: number;
//   course_id: string;
//   module: string;
//   step_title: string;
//   prompt_template: string;
//   inputs?: string;
//   save_to_context: boolean;
//   context_key?: string;
//   marks_completion: boolean;
//   unlocks_modules?: string;
//   icon_url?: string;
//   created_at?: string;
//   updated_at?: string;
// }

// // Fetch all settings for a given course
// export function getAISettings(courseId: string) {
//   return API.get<AISetting[]>(`/ai_settings`, { params: { course_id: courseId } })
//     .then(res => res.data);
// }

// // Create a new step
// export function createAISetting(payload: AISetting) {
//   return API.post<AISetting>(`/ai_settings`, payload).then(res => res.data);
// }

// // Update an existing step
// export function updateAISetting(id: number, payload: Partial<AISetting>) {
//   return API.put<AISetting>(`/ai_settings/${id}`, payload).then(res => res.data);
// }
