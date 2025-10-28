import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';
import { dbUpdate, TABLES } from '../shared/dynamodb';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};
    const userId = getUserIdFromEvent(event);

    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    switch (path) {
      case '/ads/reward':
        return await rewardAdViewed(userId, body);
      case '/ads/config':
        return await getAdConfig();
      default:
        return errorResponse('Endpoint not found', 404);
    }
  } catch (error) {
    console.error('Ads error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const getUserIdFromEvent = (event: APIGatewayProxyEvent): string | null => {
  return 'mock-user-id';
};

const rewardAdViewed = async (userId: string, body: any) => {
  const { adType, adId, watchTime } = body;

  if (!adType || !adId) {
    return errorResponse('Ad type and ID are required');
  }

  try {
    // Calculate reward based on ad type
    let reward = 0;
    switch (adType) {
      case 'banner':
        reward = 1; // $0.01
        break;
      case 'interstitial':
        reward = 5; // $0.05
        break;
      case 'rewarded':
        reward = 10; // $0.10
        break;
      case 'video':
        reward = Math.min(watchTime || 0, 30) * 0.5; // $0.005 per second, max 30s
        break;
      default:
        return errorResponse('Invalid ad type');
    }

    // Update user balance
    await dbUpdate(
      TABLES.BALANCES,
      { userId },
      'SET currentBalance = currentBalance + :reward, totalEarned = totalEarned + :reward, lastUpdated = :now',
      {
        ':reward': Math.round(reward),
        ':now': new Date().toISOString(),
      }
    );

    await dbUpdate(
      TABLES.USERS,
      { userId },
      'SET balance = balance + :reward, updatedAt = :now',
      {
        ':reward': Math.round(reward),
        ':now': new Date().toISOString(),
      }
    );

    return successResponse({
      message: 'Ad reward processed',
      reward: Math.round(reward),
      adType,
      adId,
    });
  } catch (error) {
    console.error('Ad reward error:', error);
    return errorResponse('Failed to process ad reward');
  }
};

const getAdConfig = async () => {
  try {
    // Mock AdMob configuration
    const config = {
      adUnits: {
        banner: {
          android: 'ca-app-pub-3940256099942544/6300978111',
          ios: 'ca-app-pub-3940256099942544/2934735716',
        },
        interstitial: {
          android: 'ca-app-pub-3940256099942544/1033173712',
          ios: 'ca-app-pub-3940256099942544/4411468910',
        },
        rewarded: {
          android: 'ca-app-pub-3940256099942544/5224354917',
          ios: 'ca-app-pub-3940256099942544/1712485313',
        },
      },
      rewards: {
        banner: 1,
        interstitial: 5,
        rewarded: 10,
        video: 15,
      },
      frequency: {
        banner: 'continuous',
        interstitial: 300, // 5 minutes
        rewarded: 600, // 10 minutes
      },
    };

    return successResponse(config);
  } catch (error) {
    console.error('Ad config error:', error);
    return errorResponse('Failed to get ad configuration');
  }
};