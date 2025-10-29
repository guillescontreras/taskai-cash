import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbUpdate, dbPut, TABLES } from '../shared/dynamodb';
import { v4 as uuidv4 } from 'uuid';

// Sistema de créditos interno - sin pagos reales
export const handleCreditsSystem = async (userId: string, body: any, action: string) => {
  switch (action) {
    case 'request_cashout':
      return await requestCashout(userId, body);
    case 'get_cashout_history':
      return await getCashoutHistory(userId);
    case 'admin_approve_cashout':
      return await adminApproveCashout(body);
    default:
      return errorResponse('Invalid action');
  }
};

const requestCashout = async (userId: string, body: any) => {
  const { amount, method, details } = body;
  const MINIMUM_CASHOUT = 1000; // $10.00 in cents

  if (!amount || amount < MINIMUM_CASHOUT) {
    return errorResponse(`Minimum cashout is $${MINIMUM_CASHOUT / 100}`);
  }

  if (!method || !details) {
    return errorResponse('Payment method and details are required');
  }

  try {
    // Get user balance
    const balance = await dbGet(TABLES.BALANCES, { userId });
    
    if (!balance || balance.currentBalance < amount) {
      return errorResponse('Insufficient balance');
    }

    // Create cashout request
    const cashoutId = uuidv4();
    const cashoutRequest = {
      cashoutId,
      userId,
      amount,
      method, // 'paypal', 'bank_transfer', 'crypto', etc.
      details, // email, bank info, wallet address, etc.
      status: 'pending',
      requestedAt: new Date().toISOString(),
      adminNotes: '',
    };

    // Save to a cashout requests table (you'd need to create this)
    await dbPut('taskai-cashout-requests', cashoutRequest);

    // Reserve the amount (don't deduct yet, wait for admin approval)
    await dbUpdate(
      TABLES.BALANCES,
      { userId },
      'SET reservedBalance = if_not_exists(reservedBalance, :zero) + :amount, lastUpdated = :now',
      {
        ':amount': amount,
        ':zero': 0,
        ':now': new Date().toISOString(),
      }
    );

    return successResponse({
      message: 'Cashout request submitted successfully',
      cashoutId,
      amount,
      status: 'pending',
      estimatedProcessing: '1-3 business days',
      note: 'Your request will be reviewed by our team'
    });
  } catch (error) {
    console.error('Cashout request error:', error);
    return errorResponse('Failed to process cashout request');
  }
};

const getCashoutHistory = async (userId: string) => {
  try {
    // Mock history - replace with real query to cashout requests table
    const history = [
      {
        cashoutId: 'co_1',
        amount: 1000,
        method: 'paypal',
        status: 'completed',
        requestedAt: '2024-10-20T10:00:00Z',
        completedAt: '2024-10-22T15:30:00Z',
      },
      {
        cashoutId: 'co_2',
        amount: 500,
        method: 'paypal',
        status: 'pending',
        requestedAt: '2024-10-25T14:20:00Z',
      },
    ];

    return successResponse({
      history,
      totalCashedOut: 1000,
      pendingAmount: 500,
    });
  } catch (error) {
    console.error('Cashout history error:', error);
    return errorResponse('Failed to get cashout history');
  }
};

const adminApproveCashout = async (body: any) => {
  const { cashoutId, action, adminNotes } = body; // action: 'approve' | 'reject'

  if (!cashoutId || !action) {
    return errorResponse('Cashout ID and action are required');
  }

  try {
    // Get cashout request (mock - replace with real query)
    const cashoutRequest = {
      cashoutId,
      userId: 'user123',
      amount: 1000,
      status: 'pending'
    };

    if (action === 'approve') {
      // Process the actual payment here (PayPal, bank transfer, etc.)
      // For now, just mark as completed
      
      // Update user balance (deduct the reserved amount)
      await dbUpdate(
        TABLES.BALANCES,
        { userId: cashoutRequest.userId },
        'SET currentBalance = currentBalance - :amount, reservedBalance = reservedBalance - :amount, lastUpdated = :now',
        {
          ':amount': cashoutRequest.amount,
          ':now': new Date().toISOString(),
        }
      );

      return successResponse({
        message: 'Cashout approved and processed',
        cashoutId,
        status: 'completed'
      });
    } else if (action === 'reject') {
      // Release reserved amount back to available balance
      await dbUpdate(
        TABLES.BALANCES,
        { userId: cashoutRequest.userId },
        'SET reservedBalance = reservedBalance - :amount, lastUpdated = :now',
        {
          ':amount': cashoutRequest.amount,
          ':now': new Date().toISOString(),
        }
      );

      return successResponse({
        message: 'Cashout rejected',
        cashoutId,
        status: 'rejected',
        reason: adminNotes
      });
    }

    return errorResponse('Invalid action');
  } catch (error) {
    console.error('Admin cashout error:', error);
    return errorResponse('Failed to process admin action');
  }
};