import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({ region: process.env.AWS_REGION || 'us-east-1' });
export const dynamodb = DynamoDBDocumentClient.from(client);

export const TABLES = {
  USERS: process.env.USERS_TABLE || 'taskai-users',
  TASKS: process.env.TASKS_TABLE || 'taskai-tasks',
  BALANCES: process.env.BALANCES_TABLE || 'taskai-balances',
};

export const dbGet = async (tableName: string, key: any) => {
  const command = new GetCommand({ TableName: tableName, Key: key });
  const result = await dynamodb.send(command);
  return result.Item;
};

export const dbPut = async (tableName: string, item: any) => {
  const command = new PutCommand({ TableName: tableName, Item: item });
  await dynamodb.send(command);
  return item;
};

export const dbUpdate = async (tableName: string, key: any, updateExpression: string, expressionAttributeValues: any) => {
  const command = new UpdateCommand({
    TableName: tableName,
    Key: key,
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW',
  });
  const result = await dynamodb.send(command);
  return result.Attributes;
};

export const dbQuery = async (tableName: string, keyConditionExpression: string, expressionAttributeValues: any) => {
  const command = new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
  });
  const result = await dynamodb.send(command);
  return result.Items || [];
};