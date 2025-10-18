import { SQSEvent } from 'aws-lambda';
import { IPaymentMessage } from '../../interfaces/payment-message.interface';
import { MESSAGE } from '../../enums/message.enum';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { IUpdateCard } from '../../interfaces/card.interface';
import { IUpdateTransaction } from '../../interfaces/transaction.interface';

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      console.log('🚀 ~ transaction ~ record:', record.body);
      const { type, data }: IPaymentMessage = JSON.parse(record.body);
      console.log('🚀 ~ transaction ~ data:', data);

      const cardTablePartitionKeyName = 'uuid';
      const cardTableSortKeyName = 'createdAt';
      const paymentsPartitionKeyName = 'traceId';

      if (type === MESSAGE.CHECK_BALANCE) {
        const newBalance = data.cardBalance! - data.service.precio_mensual;

        const apiResponse = await fetch(
          'https://sq3quvo0g8.execute-api.us-east-1.amazonaws.com/prod/transactions/purchase',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              cardId: data.cardId,
              merchant: data.service.proveedor,
              amount: data.service.precio_mensual,
            }),
          }
        );
        console.log('🚀 ~ handler ~ apiResponse:', apiResponse);

        await dynamoDbProvider.update<IUpdateCard>(
          process.env.CARD_TABLE_NAME!,
          cardTablePartitionKeyName,
          data.cardId,
          {
            balance: newBalance,
          },
          cardTableSortKeyName,
          data.cardCreatedAt
        );

        await dynamoDbProvider.update<IUpdateTransaction>(
          process.env.PAYMENTS_TABLE_NAME!,
          paymentsPartitionKeyName,
          data.traceId,
          {
            status: 'FINISH',
            timestamp: new Date().toISOString(),
          }
        );
      }
    }
  } catch (error) {
    console.error('🚀 ~ handler ~ error:', error);
    throw error;
  }
};
