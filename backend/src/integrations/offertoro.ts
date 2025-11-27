import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { successResponse, errorResponse } from '../shared/response';

// OfferToro Configuration
const OFFERTORO_CONFIG = {
  publisherId: process.env.OFFERTORO_PUBLISHER_ID || 'DEMO_PUBLISHER',
  secretKey: process.env.OFFERTORO_SECRET_KEY || 'DEMO_SECRET',
  baseUrl: 'https://www.offertoro.com/api/v1'
};

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path } = event;

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    if (path.includes('/offers')) {
      return await getOffers(event);
    }

    if (path.includes('/postback')) {
      return await handlePostback(event);
    }

    return errorResponse('Endpoint not found', 404);
  } catch (error) {
    console.error('OfferToro error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const getOffers = async (event: APIGatewayProxyEvent) => {
  const userId = event.queryStringParameters?.user_id || 'demo_user';

  const mockOffers = [
    {
      offerId: 'ot_survey_001',
      title: 'Encuesta sobre Productos de Belleza',
      description: 'Responde 12 preguntas sobre tus preferencias de belleza',
      payout: 75,
      userReward: 53,
      appProfit: 22,
      category: 'survey',
      provider: 'OfferToro',
      estimatedTime: '5-8 minutos',
      clickUrl: `https://www.offertoro.com/click/demo/${userId}`
    },
    {
      offerId: 'ot_app_002', 
      title: 'Descargar "Fitness Tracker Pro"',
      description: 'Descarga la app, regístrate y úsala por 3 días',
      payout: 150,
      userReward: 105,
      appProfit: 45,
      category: 'app_download',
      provider: 'OfferToro',
      estimatedTime: '10-15 minutos',
      clickUrl: `https://play.google.com/store/apps/details?id=com.fitness.tracker`
    }
  ];

  return successResponse({
    offers: mockOffers,
    totalOffers: mockOffers.length,
    provider: 'OfferToro'
  });
};

const handlePostback = async (event: APIGatewayProxyEvent) => {
  const params = event.queryStringParameters || {};
  const { user_id: userId, offer_id: offerId, payout, status } = params;

  if (status === 'completed') {
    const totalPayout = parseFloat(payout || '0');
    const userReward = Math.round(totalPayout * 0.7);
    const appProfit = Math.round(totalPayout * 0.3);

    console.log(`Offer completed: User ${userId}, Reward: $${userReward/100}, Profit: $${appProfit/100}`);

    return successResponse({
      message: 'Offer completion processed',
      userId,
      offerId,
      userReward,
      appProfit
    });
  }

  return successResponse({ message: 'Postback received' });
};