import { Request } from 'express';

export interface Task {
  id?: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  created_at?: Date;
  updated_at?: Date;
}

export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface TaskParams {
  id: string;
}

export interface TaskBody {
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export type TaskRequest = Request<TaskParams, any, TaskBody>;
export type TaskListRequest = Request<{}, any, {}>; 