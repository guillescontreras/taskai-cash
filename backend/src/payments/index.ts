import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbUpdate, TABLES } from '../shared/dynamodb';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || '';
const MINIMUM_PAYOUT = 500; // $5.00 in cents

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
      case '/payments/payout':
        return await requestPayout(userId, body);
      case '/payments/history':
        return await getPaymentHistory(userId);
      default:
        return errorResponse('Endpoint not found', 404);
    }
  } catch (error) {
    console.error('Payments error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const getUserIdFromEvent = (event: APIGatewayProxyEvent): string | null => {
  // Extract userId from JWT token - simplified for demo
  return 'mock-user-id';
};

const requestPayout = async (userId: string, body: any) => {
  const { amount, paymentMethod } = body;

  if (!amount || amount < MINIMUM_PAYOUT) {
    return errorResponse(`Minimum payout is $${MINIMUM_PAYOUT / 100}`);
  }

  try {
    // Get user balance
    const balance = await dbGet(TABLES.BALANCES, { userId });
    
    if (!balance || balance.currentBalance < amount) {
      return errorResponse('Insufficient balance');
    }

    // Mock Stripe payout - replace with real Stripe integration
    const payoutId = `payout_${Date.now()}`;
    
    // Update balance
    await dbUpdate(
      TABLES.BALANCES,
      { userId },
      'SET currentBalance = currentBalance - :amount, lastUpdated = :now',
      {
        ':amount': amount,
        ':now': new Date().toISOString(),
      }
    );

    return successResponse({
      message: 'Payout requested successfully',
      payoutId,
      amount,
      status: 'pending',
      estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Payout error:', error);
    return errorResponse('Failed to process payout');
  }
};

const getPaymentHistory = async (userId: string) => {
  try {
    // Mock payment history - replace with real database query
    const history = [
      {
        id: 'payout_1',
        amount: 1000,
        status: 'completed',
        createdAt: '2024-10-20T10:00:00Z',
        completedAt: '2024-10-23T10:00:00Z',
      },
      {
        id: 'payout_2',
        amount: 500,
        status: 'pending',
        createdAt: '2024-10-25T15:30:00Z',
      },
    ];

    return successResponse({
      history,
      totalPaidOut: 1000,
    });
  } catch (error) {
    console.error('Payment history error:', error);
    return errorResponse('Failed to get payment history');
  }
};