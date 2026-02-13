import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { addSubmission, syncOutbox } from '@/utils/db';

export type Question = {
  id: number;
  key: string;
  title: string;
  icon: string;
};

export type Demographics = {
  gender?: 'Masculino' | 'Feminino' | 'Não-binário' | 'Prefiro não responder';
  age?: 'Até 18' | '19-25' | '26-35' | '36-45' | '46-60' | '60+';
  resident?: boolean;
};

export type ResponseItem = {
  text?: string;
  audio?: string | null; // base64
};

export type SurveyData = {
  timestamp: string;
  station_id: string;
  demographics: Demographics;
  responses: Record<string, ResponseItem>;
  questions: Question[];
};

interface SurveyContextValue {
  demographics: Demographics;
  setDemographics: (d: Demographics) => void;
  responses: Record<string, ResponseItem>;
  updateResponse: (key: string, value: ResponseItem) => void;
  reset: () => void;
  submit: () => Promise<number>;
  questions: Question[];
  loading: boolean;
  inputMode: 'text' | 'audio' | null;
  setInputMode: (mode: 'text' | 'audio') => void;
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [demographics, setDemographics] = useState<Demographics>({});
  const [responses, setResponses] = useState<Record<string, ResponseItem>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputMode, setInputMode] = useState<'text' | 'audio' | null>(null);

  // Use a ref to hold the questions for the sync function to avoid re-triggering the effect
  const questionsRef = React.useRef<Question[]>([]);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;
        const response = await fetch(`${API_URL}/questions`, { cache: 'no-cache' });
        const data = await response.json();
        setQuestions(data);
        questionsRef.current = data; // Keep the ref in sync
      } catch (error) {
        console.error('Failed to fetch questions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    // This effect now runs only once on mount to set up the sync interval and online listener
    const onOnline = () => syncOutbox(questionsRef.current);
    window.addEventListener('online', onOnline);

    // Initial sync attempt
    syncOutbox(questionsRef.current);

    // Set up a periodic sync every 5 minutes
    const intervalId = setInterval(() => syncOutbox(questionsRef.current), 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', onOnline);
      clearInterval(intervalId);
    };
  }, []);

  const updateResponse: SurveyContextValue['updateResponse'] = (key, value) => {
    setResponses((prev) => {
      const newKeyResponse: ResponseItem = { };

      if (value.text !== undefined) {
        newKeyResponse.text = value.text;
        newKeyResponse.audio = null; // Clear audio
      } else if (value.audio !== undefined) {
        newKeyResponse.audio = value.audio;
        newKeyResponse.text = ''; // Clear text
      }

      return { ...prev, [key]: newKeyResponse };
    });
  };

  const reset = () => {
    setDemographics({});
    setResponses({});
    setInputMode(null);
  };

  const submit = async () => {
    const data: SurveyData = {
      timestamp: new Date().toISOString(),
      station_id: localStorage.getItem('station_id') || 'WEB',
      demographics,
      responses,
      questions,
    };
    const id = await addSubmission(data);
    // Try to sync immediately
    await syncOutbox(questions);
    reset();
    return id;
  };

  return (
    <SurveyContext.Provider value={{ demographics, setDemographics, responses, updateResponse, reset, submit, questions, loading, inputMode, setInputMode }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}
