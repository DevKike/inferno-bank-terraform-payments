import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { ICard } from '../interfaces/card.interface';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) throw new Error('Missing body is required');

  const { cardId, service } = JSON.parse(event.body);

  if (!cardId || !service)
    throw new Error('CardId and Service are required fields!');

  const cardTablePartitionKeyName = 'uuid';

  try {
    await dynamoDbProvider.getByPartitionKey<ICard>(
      process.env.CARD_TABLE_NAME!,
      cardTablePartitionKeyName,
      cardId
    );

    return {
      headers: { 'Content-Type': 'application/json' },
      statusCode: 200,
      body: JSON.stringify({
        message: 'Init payment with success!',
      }),
    };
  } catch (error) {
    console.error('Error at payment function', error);
    throw error;
  }
};
