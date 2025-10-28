import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';

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
    // Mock AI-generated tasks (replace with Amazon Q integration)
    const aiTasks = [
      {
        title: 'Complete Daily Survey',
        description: 'Answer 10 questions about your shopping preferences',
        category: category || 'surveys',
        reward: 50,
        estimatedTime: '5 minutes',
      },
      {
        title: 'Watch Product Video',
        description: 'Watch a 2-minute video about eco-friendly products',
        category: category || 'videos',
        reward: 25,
        estimatedTime: '3 minutes',
      },
      {
        title: 'Rate Mobile App',
        description: 'Download and rate a productivity app on the app store',
        category: category || 'apps',
        reward: 100,
        estimatedTime: '10 minutes',
      },
      {
        title: 'Social Media Engagement',
        description: 'Follow and like 5 posts from sponsored accounts',
        category: category || 'social',
        reward: 30,
        estimatedTime: '5 minutes',
      },
      {
        title: 'Product Review',
        description: 'Write a detailed review for a product you recently purchased',
        category: category || 'reviews',
        reward: 150,
        estimatedTime: '15 minutes',
      },
    ];

    // Filter by difficulty if specified
    let filteredTasks = aiTasks;
    if (difficulty) {
      filteredTasks = aiTasks.filter(task => {
        if (difficulty === 'easy') return task.reward <= 50;
        if (difficulty === 'medium') return task.reward > 50 && task.reward <= 100;
        if (difficulty === 'hard') return task.reward > 100;
        return true;
      });
    }

    // Randomize and limit to 3 tasks
    const shuffled = filteredTasks.sort(() => 0.5 - Math.random());
    const selectedTasks = shuffled.slice(0, 3);

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