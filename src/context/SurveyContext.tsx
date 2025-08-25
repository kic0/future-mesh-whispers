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
}

const SurveyContext = createContext<SurveyContextValue | undefined>(undefined);

export function SurveyProvider({ children }: { children: ReactNode }) {
  const [demographics, setDemographics] = useState<Demographics>({});
  const [responses, setResponses] = useState<Record<string, ResponseItem>>({});
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const API_URL = `${window.location.protocol}//${window.location.hostname}:3001`;
        const response = await fetch(`${API_URL}/questions`);
        const data = await response.json();
        setQuestions(data);
      } catch (error) {
        console.error('Failed to fetch questions', error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  useEffect(() => {
    const onOnline = () => syncOutbox(questions);
    window.addEventListener('online', onOnline);
    syncOutbox(questions);
    return () => window.removeEventListener('online', onOnline);
  }, [questions]);

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
    <SurveyContext.Provider value={{ demographics, setDemographics, responses, updateResponse, reset, submit, questions, loading }}>
      {children}
    </SurveyContext.Provider>
  );
}

export function useSurvey() {
  const ctx = useContext(SurveyContext);
  if (!ctx) throw new Error('useSurvey must be used within SurveyProvider');
  return ctx;
}
