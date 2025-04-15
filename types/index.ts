export interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  }
  
  export interface WordList {
    id: string;
    name: string;
    description: string;
    language: string;
    source?: string;
    createdAt: string;
    updatedAt: string;
    wordCount: number;
    progress: number;
  }
  
  export interface Word {
    id: string;
    listId: string;
    term: string;
    definition: string;
    context?: string;
    pronunciation?: string;
    imageUrl?: string;
    createdAt: string;
    mastery: number; // 0-100 mastery level
    lastPracticed?: string;
  }
  
  export interface LearningSession {
    id: string;
    listId: string;
    startedAt: string;
    completedAt?: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    streak: number;
  }
  
  export interface TestSession {
    id: string;
    listId: string;
    startedAt: string;
    completedAt?: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
  }
  
  export interface Question {
    id: string;
    wordId: string;
    type: 'multiple-choice' | 'typing' | 'match' | 'context';
    prompt: string;
    options?: string[];
    correctAnswer: string;
  }
  
  export interface UserStats {
    totalLists: number;
    totalWords: number;
    wordsLearned: number;
    currentStreak: number;
    longestStreak: number;
    lastActive?: string;
    sessionsCompleted: number;
    testsCompleted: number;
    averageScore: number;
  }