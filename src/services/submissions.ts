const API_URL = 'http://localhost:3001';

export interface SubmissionData {
  station_id: string
  timestamp?: string
  gender?: string
  age?: string
  resident?: boolean
  consent_given: boolean
  consent_version: string
  consent_purpose: string
}

export interface AnswerData {
  submission_id: string
  question_number: number
  question_key: string
  type: 'audio' | 'text'
  storage_path?: string
  mime_type?: string
  size_bytes?: number
  duration_seconds?: number
  text_content?: string
}

// Função para criar uma nova submissão
export async function createSubmission(data: SubmissionData) {
  try {
    console.log('Creating submission with data:', data)

    const response = await fetch(`${API_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating submission:', errorData);
      throw new Error('Failed to create submission');
    }

    const submission = await response.json();
    console.log('Submission created:', submission);
    return submission;
  } catch (error) {
    console.error('Exception in createSubmission:', error)
    throw error
  }
}

// Função para salvar uma resposta
export async function saveAnswer(data: AnswerData) {
  try {
    console.log('Saving answer with data:', data)

    const response = await fetch(`${API_URL}/answers`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Error saving answer:', errorData);
        throw new Error('Failed to save answer');
    }

    const answer = await response.json();
    console.log('Answer saved:', answer);
    return answer;
  } catch (error) {
    console.error('Failed to save answer:', error)
    throw error
  }
}
