import { SQSEvent } from 'aws-lambda';
import { MESSAGE } from '../../enums/message.enum';
import { IPaymentMessage } from '../../interfaces/payment-message.interface';
import { v4 as uuidv4 } from 'uuid';
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
              traceId: data.traceId,
              userId: data.userId,
              cardId: data.cardId,
              service: data.service,
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
