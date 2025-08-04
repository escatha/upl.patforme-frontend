// src/contexts/ExamContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
}

interface Exam {
  id: string;
  title: string;
  subject: string;
  questions: Question[];
  duration: number;
  startTime: string;
  endTime: string;
  faculty: string;
  status: 'upcoming' | 'active' | 'completed';
}

interface ExamContextType {
  exams: Exam[];
  setExams: (exams: Exam[]) => void;
  activeExam: Exam | null;
  setActiveExam: (exam: Exam | null) => void;
  examStarted: boolean;
  setExamStarted: (started: boolean) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export const ExamProvider = ({ children }: { children: ReactNode }) => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [activeExam, setActiveExam] = useState<Exam | null>(null);
  const [examStarted, setExamStarted] = useState<boolean>(false);

  return (
    <ExamContext.Provider
      value={{ exams, setExams, activeExam, setActiveExam, examStarted, setExamStarted }}
    >
      {children}
    </ExamContext.Provider>
  );
};

export const useExam = () => {
  const context = useContext(ExamContext);
  if (!context) throw new Error("useExam must be used within an ExamProvider");
  return context;
};