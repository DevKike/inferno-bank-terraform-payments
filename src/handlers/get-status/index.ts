import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { ITransaction } from '../../interfaces/transaction.interface';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.requestContext.httpMethod === 'OPTIONS') {
      return {
        statusCode: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
        body: '',
      };
    }

    if (!event.pathParameters || !event.pathParameters.traceId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Missing path parameters: traceId',
        }),
      };
    }

    const traceId = event.pathParameters.traceId;
    const paymentsPartitionKeyName = 'traceId';

    const { status } = await dynamoDbProvider.getByPartitionKey<ITransaction>(
      process.env.PAYMENTS_TABLE_NAME!,
      paymentsPartitionKeyName,
      traceId
    );

    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
      statusCode: 200,
      body: JSON.stringify({
        message: 'Status retrieved with success!',
        status,
      }),
    };
  } catch (error) {
    console.error('🚀 ~ handler ~ error:', error);
    throw error;
  }
};
