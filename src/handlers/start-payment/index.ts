/* import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { ICard } from '../../interfaces/card.interface';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {


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
 */