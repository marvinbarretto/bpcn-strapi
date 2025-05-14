export type EventStatus = 'Pending' | 'Approved' | 'Rejected' | 'Archived';

export interface BlockNode {
  type: string;
  level?: number;
  children?: { type: 'text'; text: string }[];
}

export interface ErrorResponse {
  error?: {
    status?: number;
    name?: string;
    message?: string;
    details?: any;
  };
}

export interface Role {
  id: number;
  name: string;
  description: string;
  type: string;
}