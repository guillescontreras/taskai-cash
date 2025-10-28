import { APIResponse } from './types';

export const createResponse = (statusCode: number, data: any): APIResponse => ({
  statusCode,
  body: JSON.stringify(data),
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
});

export const successResponse = (data: any) => createResponse(200, data);
export const errorResponse = (message: string, statusCode = 400) => 
  createResponse(statusCode, { error: message });