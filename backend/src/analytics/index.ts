import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PinpointClient, PutEventsCommand } from '@aws-sdk/client-pinpoint';
import { successResponse, errorResponse } from '../shared/response';

const pinpointClient = new PinpointClient({ region: process.env.AWS_REGION || 'us-east-1' });
const PINPOINT_APP_ID = process.env.PINPOINT_APP_ID || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    if (httpMethod === 'POST') {
      return await trackEvent(body);
    }

    return errorResponse('Method not allowed', 405);
  } catch (error) {
    console.error('Analytics error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const trackEvent = async (body: any) => {
  const { userId, eventType, properties, sessionId } = body;

  if (!eventType) {
    return errorResponse('Event type is required');
  }

  try {
    const eventData = {
      EventType: eventType,
      Timestamp: new Date().toISOString(),
      Session: {
        Id: sessionId || `session_${Date.now()}`,
        StartTimestamp: new Date().toISOString(),
      },
      Attributes: {
        userId: userId || 'anonymous',
        platform: properties?.platform || 'web',
        version: properties?.version || '1.0.0',
        ...properties,
      },
      Metrics: {
        revenue: properties?.revenue || 0,
        taskCount: properties?.taskCount || 0,
        sessionDuration: properties?.sessionDuration || 0,
      },
    };

    const command = new PutEventsCommand({
      ApplicationId: PINPOINT_APP_ID,
      EventsRequest: {
        BatchItem: {
          [userId || 'anonymous']: {
            Endpoint: {
              ChannelType: 'CUSTOM',
              Address: userId || 'anonymous',
              Attributes: {
                platform: [properties?.platform || 'web'],
              },
            },
            Events: {
              [eventType]: eventData,
            },
          },
        },
      },
    });

    await pinpointClient.send(command);

    return successResponse({
      message: 'Event tracked successfully',
      eventType,
      userId,
      timestamp: eventData.Timestamp,
    });
  } catch (error) {
    console.error('Track event error:', error);
    return errorResponse('Failed to track event');
  }
};