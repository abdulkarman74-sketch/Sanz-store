export interface UserData {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  theme: 'dark' | 'light';
  createdAt?: any;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: any;
  isError?: boolean;
}

export interface Chat {
  id: string;
  userId: string;
  title: string;
  model: string;
  sessionId: string;
  messages: Message[];
  createdAt: any;
  updatedAt: any;
}

export interface Model {
  id: string;
  name: string;
  endpoint: string;
  color: string;
}

export const MODELS: Model[] = [
  { id: 'claude-4.7', name: 'Claude Opus 4.7', endpoint: 'https://api.synoxcloud.xyz/ai-chat/claude-opus-4.7', color: 'border-orange-500' },
  { id: 'claude-4.8', name: 'Claude Opus 4.8', endpoint: 'https://api.synoxcloud.xyz/ai-chat/claude-opus-4.8', color: 'border-pink-500' },
  { id: 'gpt-5.5', name: 'GPT-5.5', endpoint: 'https://api.synoxcloud.xyz/ai-chat/gpt-5.5', color: 'border-purple-500' },
  { id: 'ai-coder', name: 'AI Coder', endpoint: 'https://api.synoxcloud.xyz/ai-chat/ai-coder', color: 'border-blue-500' },
];
