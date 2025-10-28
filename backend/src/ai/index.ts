import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';
import { generateTasksWithAI } from './amazonq';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    if (httpMethod === 'POST') {
      return await generateTasks(body);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('AI error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const generateTasks = async (body: any) => {
  const { category, difficulty, userPreferences } = body;

  try {
    // Use Amazon Q/Bedrock for AI task generation
    const selectedTasks = await generateTasksWithAI({
      category,
      difficulty,
      userPreferences
    });

    return successResponse({
      message: 'AI tasks generated successfully',
      tasks: selectedTasks,
      metadata: {
        category: category || 'mixed',
        difficulty: difficulty || 'mixed',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Generate tasks error:', error);
    return errorResponse('Failed to generate AI tasks');
  }
};