import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
  UpdateItemCommand,
} from '@aws-sdk/client-dynamodb';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';

const client = new DynamoDBClient();
const promptTableName = process.env.PROMPT_TABLE_NAME;
const utilTableName = process.env.UTIL_TABLE_NAME;

export const getPromptsHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Get prompt from promptTable
  const data = await client.send(
    new ScanCommand({
      TableName: promptTableName,
    })
  );
  const prompts = data.Items!.map((d) => {
    return {
      id: d.id['S'],
      prompt: d.prompt['S'],
    };
  });

  const getItemCommand = new GetItemCommand({
    TableName: utilTableName,
    Key: {
      id: { S: 'prompt_id' },
    },
  });
  const defaultPrompt = await client.send(getItemCommand);
  const selectedId = defaultPrompt.Item!['prompt_id']['S'];

  return {
    statusCode: 200,
    body: JSON.stringify({
      prompts: prompts,
      selectedId: selectedId,
    }),
  };
};

interface putPromptRequestBody {
  id?: string;
  prompt: string;
  selectedId: string;
}

export const putPromptHandler = async (
  event: APIGatewayEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  // Edit a prompt in promptTable and/or Update a prompt
  if (!event.body) {
    return {
      statusCode: 400,
      body: 'bad request',
    };
  }
  const body: putPromptRequestBody = JSON.parse(event.body);

  // Update Item if id exists
  if (body.id) {
    const putPromptCommand = new UpdateItemCommand({
      TableName: promptTableName,
      Key: {
        id: { S: body.id },
      },
      UpdateExpression: 'SET prompt = :value1',
      ExpressionAttributeValues: {
        ':value1': { S: body.prompt },
      },
    });
    await client.send(putPromptCommand);
  }

  // Update selected prompt
  const updateSelectedPromptCommand = new UpdateItemCommand({
    TableName: utilTableName,
    Key: {
      id: { S: 'prompt_id' },
    },
    UpdateExpression: 'SET prompt_id = :value1',
    ExpressionAttributeValues: {
      ':value1': { S: body.selectedId },
    },
  });
  await client.send(updateSelectedPromptCommand);

  return {
    statusCode: 200,
    body: JSON.stringify(body),
  };
};
