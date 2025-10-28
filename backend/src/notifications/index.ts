import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbUpdate, TABLES } from '../shared/dynamodb';

const snsClient = new SNSClient({ region: process.env.AWS_REGION || 'us-east-1' });
const NOTIFICATIONS_TOPIC_ARN = process.env.NOTIFICATIONS_TOPIC_ARN || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};
    const userId = getUserIdFromEvent(event);

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    switch (path) {
      case '/notifications/subscribe':
        return await subscribeToNotifications(userId, body);
      case '/notifications/send':
        return await sendNotification(body);
      case '/notifications/preferences':
        return await updateNotificationPreferences(userId, body);
      default:
        return errorResponse('Endpoint not found', 404);
    }
  } catch (error) {
    console.error('Notifications error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const getUserIdFromEvent = (event: APIGatewayProxyEvent): string | null => {
  return 'mock-user-id';
};

const subscribeToNotifications = async (userId: string | null, body: any) => {
  const { deviceToken, platform } = body;

  if (!deviceToken || !platform) {
    return errorResponse('Device token and platform are required');
  }

  try {
    if (userId) {
      await dbUpdate(
        TABLES.USERS,
        { userId },
        'SET deviceToken = :token, platform = :platform, notificationsEnabled = :enabled, updatedAt = :now',
        {
          ':token': deviceToken,
          ':platform': platform,
          ':enabled': true,
          ':now': new Date().toISOString(),
        }
      );
    }

    return successResponse({
      message: 'Successfully subscribed to notifications',
      deviceToken,
      platform,
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    return errorResponse('Failed to subscribe to notifications');
  }
};

const sendNotification = async (body: any) => {
  const { userId, title, message, type } = body;

  if (!title || !message) {
    return errorResponse('Title and message are required');
  }

  try {
    const notification = {
      title,
      message,
      type: type || 'general',
      timestamp: new Date().toISOString(),
      userId: userId || 'broadcast',
    };

    const command = new PublishCommand({
      TopicArn: NOTIFICATIONS_TOPIC_ARN,
      Message: JSON.stringify(notification),
      Subject: title,
    });

    await snsClient.send(command);

    return successResponse({
      message: 'Notification sent successfully',
      notification,
    });
  } catch (error) {
    console.error('Send notification error:', error);
    return errorResponse('Failed to send notification');
  }
};

const updateNotificationPreferences = async (userId: string | null, body: any) => {
  const { taskReminders, payoutAlerts, newTasks, promotions } = body;

  if (!userId) {
    return errorResponse('User ID is required');
  }

  try {
    await dbUpdate(
      TABLES.USERS,
      { userId },
      'SET notificationPreferences = :prefs, updatedAt = :now',
      {
        ':prefs': {
          taskReminders: taskReminders !== false,
          payoutAlerts: payoutAlerts !== false,
          newTasks: newTasks !== false,
          promotions: promotions !== false,
        },
        ':now': new Date().toISOString(),
      }
    );

    return successResponse({
      message: 'Notification preferences updated',
      preferences: {
        taskReminders,
        payoutAlerts,
        newTasks,
        promotions,
      },
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    return errorResponse('Failed to update notification preferences');
  }
};