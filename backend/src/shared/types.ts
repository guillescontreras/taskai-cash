export interface User {
  userId: string;
  email: string;
  name: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  taskId: string;
  userId: string;
  title: string;
  description: string;
  reward: number;
  status: 'pending' | 'completed' | 'expired';
  category: string;
  createdAt: string;
  completedAt?: string;
  expiresAt: string;
}

export interface Balance {
  userId: string;
  totalEarned: number;
  currentBalance: number;
  lastUpdated: string;
}

export interface APIResponse<T = any> {
  statusCode: number;
  body: string;
  headers: {
    'Content-Type': string;
    'Access-Control-Allow-Origin': string;
    'Access-Control-Allow-Methods': string;
    'Access-Control-Allow-Headers': string;
  };
}