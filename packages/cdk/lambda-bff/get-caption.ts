import {
  DynamoDBClient,
  QueryCommand,
  QueryCommandInput,
} from '@aws-sdk/client-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const client = new DynamoDBClient();

export const handler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Get data from DynamoDB Table
  const tableName = process.env.TABLE_NAME;
  const params: QueryCommandInput = {
    TableName: tableName,
    KeyConditionExpression: '#id = :id',
    ExpressionAttributeNames: {
      '#id': 'id',
    },
    ExpressionAttributeValues: {
      ':id': { S: '1' },
    },
    ScanIndexForward: false,
    Limit: 1,
  };
  const command = new QueryCommand(params);
  const data = await client.send(command);
  const result = data.Items ? data.Items[0] : {};

  // Return a response
  return {
    statusCode: 200,
    body: JSON.stringify(result),
  };
};
