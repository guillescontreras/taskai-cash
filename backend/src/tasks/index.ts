import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbPut, dbUpdate, dbQuery, TABLES } from '../shared/dynamodb';
import { Task, User, Balance } from '../shared/types';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, pathParameters, queryStringParameters } = event;
    const body = event.body ? JSON.parse(event.body) : {};
    const userId = getUserIdFromEvent(event);

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    switch (httpMethod) {
      case 'GET':
        return await getTasks(userId, queryStringParameters);
      case 'POST':
        return await createTask(userId, body);
      case 'PUT':
        return await updateTask(userId, pathParameters?.taskId, body);
      default:
        return errorResponse('Method not allowed', 405);
    }
  } catch (error) {
    console.error('Tasks error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const getUserIdFromEvent = (event: APIGatewayProxyEvent): string | null => {
  // Extract userId from JWT token in Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    // For demo, create a consistent user ID based on IP or use default
    const userAgent = event.headers['User-Agent'] || event.headers['user-agent'] || '';
    const sourceIp = event.requestContext?.identity?.sourceIp || 'unknown';
    return `user_${Buffer.from(sourceIp + userAgent).toString('base64').slice(0, 8)}`;
  }
  
  // For now, return a mock userId - in production, decode JWT
  return 'mock-user-id';
};

const getTasks = async (userId: string, queryParams: any) => {
  try {
    const status = queryParams?.status;
    
    let tasks = await dbQuery(TABLES.TASKS, 'userId = :userId', { ':userId': userId });
    
    if (status) {
      tasks = tasks.filter((task: any) => task.status === status);
    }

    return successResponse({
      tasks: tasks.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    return errorResponse('Failed to get tasks');
  }
};

const createTask = async (userId: string, body: any) => {
  const { title, description, category, reward } = body;

  if (!title || !description || !category || !reward) {
    return errorResponse('Title, description, category and reward are required');
  }

  try {
    const taskId = uuidv4();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours

    const task: Task = {
      taskId,
      userId,
      title,
      description,
      reward: Number(reward),
      status: 'pending',
      category,
      createdAt: now,
      expiresAt,
    };

    await dbPut(TABLES.TASKS, task);

    return successResponse({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    console.error('Create task error:', error);
    return errorResponse('Failed to create task');
  }
};

const updateTask = async (userId: string, taskId: string | undefined, body: any) => {
  if (!taskId) {
    return errorResponse('Task ID is required');
  }

  const { status } = body;

  if (!status) {
    return errorResponse('Status is required');
  }

  try {
    // Get existing task
    const existingTask = await dbGet(TABLES.TASKS, { taskId, userId });
    
    if (!existingTask) {
      return errorResponse('Task not found', 404);
    }

    // Update task
    const updatedTask = await dbUpdate(
      TABLES.TASKS,
      { taskId, userId },
      'SET #status = :status, completedAt = :completedAt',
      {
        ':status': status,
        ':completedAt': status === 'completed' ? new Date().toISOString() : null,
      }
    );

    // If task completed, update user balance
    if (status === 'completed' && existingTask.status !== 'completed') {
      await updateUserBalance(userId, existingTask.reward);
    }

    return successResponse({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    console.error('Update task error:', error);
    return errorResponse('Failed to update task');
  }
};

const updateUserBalance = async (userId: string, reward: number) => {
  try {
    // Update balance table
    await dbUpdate(
      TABLES.BALANCES,
      { userId },
      'SET totalEarned = totalEarned + :reward, currentBalance = currentBalance + :reward, lastUpdated = :now',
      {
        ':reward': reward,
        ':now': new Date().toISOString(),
      }
    );

    // Update user table
    await dbUpdate(
      TABLES.USERS,
      { userId },
      'SET balance = balance + :reward, updatedAt = :now',
      {
        ':reward': reward,
        ':now': new Date().toISOString(),
      }
    );
  } catch (error) {
    console.error('Update balance error:', error);
    throw error;
  }
};