import { SQSEvent } from 'aws-lambda';
import { IPaymentMessage } from '../../interfaces/payment-message.interface';
import { MESSAGE } from '../../enums/message.enum';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';
import { ICard } from '../../interfaces/card.interface';
import { IUpdateTransaction } from '../../interfaces/transaction.interface';

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const { type, data }: IPaymentMessage = JSON.parse(record.body);

      const cardTablePartitionKeyName = 'uuid';
      const paymentsTablePartitionKeyName = 'traceId';

      if (type === MESSAGE.START_PAYMENT) {
        const card: ICard = await dynamoDbProvider.getByPartitionKey(
          process.env.CARD_TABLE_NAME!,
          cardTablePartitionKeyName,
          data.cardId
        );

        if (card.balance <= 0 || card.balance < data.service.precio_mensual) {
          await dynamoDbProvider.update<IUpdateTransaction>(
            process.env.PAYMENTS_TABLE_NAME!,
            paymentsTablePartitionKeyName,
            data.traceId,
            {
              status: 'FAILED',
              error: 'Card does not have enough balance!',
            }
          );
          return;
        }

        await dynamoDbProvider.update<IUpdateTransaction>(
          process.env.PAYMENTS_TABLE_NAME!,
          paymentsTablePartitionKeyName,
          data.traceId,
          {
            status: 'IN PROGRESS',
          }
        );
      }
    }
  } catch (error) {
    console.error('🚀 ~ handler ~ error:', error);
    throw error;
  }
};
