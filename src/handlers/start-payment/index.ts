import { SQSEvent } from 'aws-lambda';
import { MESSAGE } from '../../enums/message.enum';
import { IPaymentMessage } from '../../interfaces/payment-message.interface';
import { ITransaction } from '../../interfaces/transaction.interface';
import { sqsProvider } from '../../providers/sqs.provider';
import { dynamoDbProvider } from '../../providers/dynamo-db.provider';

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const { type, data }: IPaymentMessage = JSON.parse(record.body);

      if (type === MESSAGE.PAYMENT) {
        const transaction: ITransaction = {
          cardId: data.cardId,
          userId: data.userId,
          service: data.service,
          traceId: data.traceId,
          status: 'INITIAL',
          timestamp: new Date().toISOString(),
        };

        await dynamoDbProvider.save(
          process.env.PAYMENTS_TABLE_NAME!,
          transaction
        );

        await sqsProvider.send<IPaymentMessage>(
          process.env.CHECK_BALANCE_QUEUE_URL!,
          {
            type: MESSAGE.START_PAYMENT,
            data: {
              userId: data.userId,
              cardId: data.cardId,
              cardBalance: data.cardBalance!,
              cardCreatedAt: data.cardCreatedAt!,
              service: data.service,
              traceId: data.traceId,
              timestamp: new Date().toISOString(),
            },
          }
        );
      }
    }
  } catch (error) {
    console.error('Error at start payment logic', error);
    throw error;
  }
};
