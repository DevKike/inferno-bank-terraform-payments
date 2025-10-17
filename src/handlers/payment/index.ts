import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { ICard } from '../../interfaces/card.interface';
import { sqsProvider } from '../../providers/sqs.provider';
import { v4 as uuidv4 } from 'uuid';
import { MESSAGE } from '../../enums/message.enum';
import { IPaymentMessage } from '../../interfaces/payment-message.interface';

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

    const traceId = uuidv4();

    await sqsProvider.send<IPaymentMessage>(
      process.env.START_PAYMENT_QUEUE_URL!,
      {
        type: MESSAGE.PAYMENT,
        data: {
          cardId,
          userId,
          service,
          traceId,
          timestamp: new Date().toISOString(),
        },
      }
    );

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
