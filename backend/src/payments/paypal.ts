import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbUpdate, TABLES } from '../shared/dynamodb';

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID || '';
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET || '';
const PAYPAL_BASE_URL = process.env.PAYPAL_ENV === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

const MINIMUM_PAYOUT = 500; // $5.00 in cents

export const handlePayPalPayout = async (userId: string, body: any) => {
  const { amount, email } = body;

  if (!amount || amount < MINIMUM_PAYOUT) {
    return errorResponse(`Minimum payout is $${MINIMUM_PAYOUT / 100}`);
  }

  if (!email) {
    return errorResponse('PayPal email is required');
  }

  try {
    // Get user balance
    const balance = await dbGet(TABLES.BALANCES, { userId });
    
    if (!balance || balance.currentBalance < amount) {
      return errorResponse('Insufficient balance');
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    
    if (!accessToken) {
      return errorResponse('PayPal authentication failed');
    }

    // Create payout
    const payoutResult = await createPayPalPayout(accessToken, {
      amount: amount / 100, // Convert cents to dollars
      email,
      userId
    });

    if (payoutResult.success) {
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
        payoutId: payoutResult.payoutId,
        amount,
        status: 'pending',
        estimatedArrival: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } else {
      return errorResponse('PayPal payout failed: ' + payoutResult.error);
    }
  } catch (error) {
    console.error('PayPal payout error:', error);
    return errorResponse('Failed to process payout');
  }
};

const getPayPalAccessToken = async (): Promise<string | null> => {
  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('PayPal auth error:', error);
    return null;
  }
};

const createPayPalPayout = async (accessToken: string, payoutData: any) => {
  try {
    const payoutRequest = {
      sender_batch_header: {
        sender_batch_id: `batch_${Date.now()}`,
        email_subject: 'TaskAI Cash Payout',
        email_message: 'You have received a payment from TaskAI Cash!'
      },
      items: [{
        recipient_type: 'EMAIL',
        amount: {
          value: payoutData.amount.toFixed(2),
          currency: 'USD'
        },
        receiver: payoutData.email,
        note: `TaskAI Cash payout for user ${payoutData.userId}`,
        sender_item_id: `item_${Date.now()}`
      }]
    };

    const response = await fetch(`${PAYPAL_BASE_URL}/v1/payments/payouts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payoutRequest),
    });

    const data = await response.json();
    
    if (response.ok) {
      return {
        success: true,
        payoutId: data.batch_header.payout_batch_id
      };
    } else {
      return {
        success: false,
        error: data.message || 'Unknown PayPal error'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Network error'
    };
  }
};