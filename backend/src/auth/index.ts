import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, InitiateAuthCommand, SignUpCommand, ConfirmSignUpCommand } from '@aws-sdk/client-cognito-identity-provider';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '../shared/response';
import { dbGet, dbPut, TABLES } from '../shared/dynamodb';
import { User, Balance } from '../shared/types';

const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });
const USER_POOL_CLIENT_ID = process.env.USER_POOL_CLIENT_ID || '';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const { httpMethod, path } = event;
    const body = event.body ? JSON.parse(event.body) : {};

    if (httpMethod === 'OPTIONS') {
      return successResponse({});
    }

    switch (path) {
      case '/auth/signup':
        return await signup(body);
      case '/auth/login':
        return await login(body);
      case '/auth/confirm':
        return await confirmSignup(body);
      default:
        return errorResponse('Endpoint not found', 404);
    }
  } catch (error) {
    console.error('Auth error:', error);
    return errorResponse('Internal server error', 500);
  }
};

const signup = async (body: any) => {
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return errorResponse('Email, password and name are required');
  }

  try {
    // Sign up in Cognito
    const signUpCommand = new SignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'name', Value: name },
      ],
    });

    const cognitoResult = await cognitoClient.send(signUpCommand);
    const userId = cognitoResult.UserSub!;

    // Create user in DynamoDB
    const user: User = {
      userId,
      email,
      name,
      balance: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbPut(TABLES.USERS, user);

    // Create initial balance
    const balance: Balance = {
      userId,
      totalEarned: 0,
      currentBalance: 0,
      lastUpdated: new Date().toISOString(),
    };

    await dbPut(TABLES.BALANCES, balance);

    return successResponse({
      message: 'User created successfully',
      userId,
      confirmationRequired: true,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return errorResponse(error.message || 'Signup failed');
  }
};

const login = async (body: any) => {
  const { email, password } = body;

  if (!email || !password) {
    return errorResponse('Email and password are required');
  }

  try {
    const authCommand = new InitiateAuthCommand({
      ClientId: USER_POOL_CLIENT_ID,
      AuthFlow: 'USER_PASSWORD_AUTH',
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const result = await cognitoClient.send(authCommand);

    if (result.AuthenticationResult) {
      const { AccessToken, IdToken, RefreshToken } = result.AuthenticationResult;
      
      return successResponse({
        message: 'Login successful',
        tokens: {
          accessToken: AccessToken,
          idToken: IdToken,
          refreshToken: RefreshToken,
        },
      });
    } else {
      return errorResponse('Authentication failed');
    }
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Login failed');
  }
};

const confirmSignup = async (body: any) => {
  const { email, confirmationCode } = body;

  if (!email || !confirmationCode) {
    return errorResponse('Email and confirmation code are required');
  }

  try {
    const confirmCommand = new ConfirmSignUpCommand({
      ClientId: USER_POOL_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    await cognitoClient.send(confirmCommand);

    return successResponse({
      message: 'Email confirmed successfully',
    });
  } catch (error: any) {
    console.error('Confirmation error:', error);
    return errorResponse(error.message || 'Confirmation failed');
  }
};