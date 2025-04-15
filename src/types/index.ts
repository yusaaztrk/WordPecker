// Navigation Types
export type RootStackParamList = {
  // Mevcut ekranlar
  Home: undefined;
  FeaturePlaceholder: { featureId: number; featureName: string; description: string };
  
  // Auth ekranları
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  
  // Ana ekranlar
  WordLists: undefined; // Lists yerine
  CreateList: undefined;
  ListDetail: { listId: string; name?: string; edit?: boolean };
  AddWord: { listId: string };
  Learning: { listId: string }; // Learn yerine
  Quiz: { listId: string };
  Progress: undefined;
  Search: undefined;
  Settings: undefined;
  Profile: undefined;
  
  // Yenilikçi özellikler
  ScanWords: undefined;
  MicroLearning: undefined;
  
  // Tab navigatörler
  HomeTab: undefined;
  ListsTab: undefined;
  SearchTab: undefined;
  ProgressTab: undefined;
  InnovativeTab: undefined;
  SettingsTab: undefined;
  
  // Splash Screen
  Splash: undefined;
};

// Data Types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: string;
}

export interface WordList {
  id: string;
  name: string;
  description: string;
  context?: string;
  createdAt: string;
  wordCount?: number;
}

export interface Word {
  id: string;
  listId: string;
  value: string;
  meaning: string;
  createdAt: string;
}

export interface Exercise {
  wordId: string;
  type: 'multiple_choice';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Quiz {
  wordId: string;
  type: 'quiz';
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface Progress {
  listId: string;
  wordId: string;
  mastery: number; // 0-100
  lastPracticed: string;
  timesCorrect: number;
  timesIncorrect: number;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthContextProps {
  authState: AuthState;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
}
