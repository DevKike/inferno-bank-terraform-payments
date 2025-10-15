import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { ICard } from '../../interfaces/card.interface';
import { sqsProvider } from '../../providers/sqs.provider';
import { v4 as uuidv4 } from 'uuid';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!event.body) throw new Error('Missing body is required');

  const { cardId, service } = JSON.parse(event.body);

  if (!cardId || !service)
    throw new Error('CardId and Service are required fields!');

  const cardTablePartitionKeyName = 'uuid';

  try {
    const { userId } = await dynamoDbProvider.getByPartitionKey<ICard>(
      process.env.CARD_TABLE_NAME!,
      cardTablePartitionKeyName,
      cardId
    );

    await sqsProvider.send(process.env.START_PAYMENT_QUEUE_URL!, {
      type: 'PAYMENT',
      data: {
        userId,
        date: new Date().toISOString(),
      },
    });

    const traceId = uuidv4();

    return {
      headers: { 'Content-Type': 'application/json' },
      statusCode: 200,
      body: JSON.stringify({
        message: 'Payment initialized with success!',
        traceId,
      }),
    };
  } catch (error) {
    console.error('Error at payment function', error);
    throw error;
  }
};
{
}
