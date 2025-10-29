import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbUpdate, TABLES } from '../shared/dynamodb';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN || '';
const MP_BASE_URL = 'https://api.mercadopago.com';
const MINIMUM_PAYOUT = 10000; // $100 ARS in centavos

export const handleMercadoPagoPayout = async (userId: string, body: any) => {
  const { amount, cbu, alias, accountHolder } = body;

  if (!amount || amount < MINIMUM_PAYOUT) {
    return errorResponse(`Mínimo de retiro: $${MINIMUM_PAYOUT / 100} ARS`);
  }

  if (!cbu && !alias) {
    return errorResponse('CBU o Alias bancario requerido');
  }

  try {
    // Verificar balance del usuario
    const balance = await dbGet(TABLES.BALANCES, { userId });
    
    if (!balance || balance.currentBalance < amount) {
      return errorResponse('Saldo insuficiente');
    }

    // Crear transferencia en MercadoPago
    const transferResult = await createMPTransfer({
      amount: amount / 100, // Convertir centavos a pesos
      cbu: cbu || alias,
      accountHolder,
      userId
    });

    if (transferResult.success) {
      // Actualizar balance del usuario
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
        message: 'Transferencia iniciada exitosamente',
        transferId: transferResult.transferId,
        amount,
        status: 'pending',
        estimatedArrival: 'Mismo día hábil',
        fee: 5000 // $50 ARS fee
      });
    } else {
      return errorResponse('Error en MercadoPago: ' + transferResult.error);
    }
  } catch (error) {
    console.error('MercadoPago error:', error);
    return errorResponse('Error al procesar transferencia');
  }
};

const createMPTransfer = async (transferData: any) => {
  try {
    const transferRequest = {
      transaction_amount: transferData.amount,
      description: `TaskAI Cash - Retiro usuario ${transferData.userId}`,
      payment_method_id: 'account_money',
      payer: {
        email: 'noreply@taskaicash.com',
        identification: {
          type: 'CUIT',
          number: '20123456789' // Tu CUIT
        }
      },
      additional_info: {
        items: [{
          id: 'payout',
          title: 'TaskAI Cash Payout',
          quantity: 1,
          unit_price: transferData.amount
        }]
      },
      external_reference: `payout_${Date.now()}`,
      notification_url: 'https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod/payments/webhook'
    };

    const response = await fetch(`${MP_BASE_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(transferRequest),
    });

    const data = await response.json();
    
    if (response.ok && data.status === 'approved') {
      return {
        success: true,
        transferId: data.id
      };
    } else {
      return {
        success: false,
        error: data.message || 'Error desconocido de MercadoPago'
      };
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Error de conexión'
    };
  }
};

// Webhook para recibir notificaciones de MercadoPago
export const handleMPWebhook = async (event: APIGatewayProxyEvent) => {
  try {
    const body = JSON.parse(event.body || '{}');
    
    if (body.type === 'payment') {
      const paymentId = body.data.id;
      
      // Consultar estado del pago
      const paymentStatus = await getPaymentStatus(paymentId);
      
      if (paymentStatus.status === 'approved') {
        console.log(`Pago ${paymentId} aprobado`);
        // Actualizar estado en base de datos si es necesario
      }
    }

    return successResponse({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return errorResponse('Webhook processing failed');
  }
};

const getPaymentStatus = async (paymentId: string) => {
  try {
    const response = await fetch(`${MP_BASE_URL}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Payment status error:', error);
    return null;
  }
};