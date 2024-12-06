import { fetchAuth } from './auth';

const apiEndpoint = process.env.NEXT_PUBLIC_API_ENDPOINT ?? '';

export interface Prompt {
  id: string;
  prompt: string;
}

interface getPromptsResponse {
  prompts: Prompt[];
  selectedId: string;
}

export async function getPrompts(): Promise<getPromptsResponse> {
  let data;
  try {
    const endpoint = `${apiEndpoint}/prompts`;
    const response = await fetchAuth(endpoint);
    data = await response.json();
  } catch (error) {
    console.error(error);
  }
  return data;
}

interface putPromptProps {
  id?: string;
  prompt?: string;
  selectedId: string;
}

export async function putPrompt(req: putPromptProps): Promise<putPromptProps> {
  let data;
  try {
    const endpoint = `${apiEndpoint}/prompt`;
    const response = await fetchAuth(endpoint, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req),
    });
    data = response.json();
  } catch (error) {
    console.error(error);
  }
  return data;
}
