import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const API_URL = process.env.STRAPI_URL || 'http://localhost:1337';
export const ADMIN_TOKEN = process.env.STRAPI_SEEDER_TOKEN;

if (!ADMIN_TOKEN) {
  console.error('❌ STRAPI_SEEDER_TOKEN is missing. Please check your .env file');
  process.exit(1);
}

export const HEADERS = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${ADMIN_TOKEN}`,
};

export const REQUIRED_ROLES = ['Authenticated', 'Author', 'Admin'] as const;
export type RoleName = (typeof REQUIRED_ROLES)[number];

export interface ErrorResponse {
  error?: {
    status?: number;
    name?: string;
    message?: string;
    details?: any;
  };
}
  