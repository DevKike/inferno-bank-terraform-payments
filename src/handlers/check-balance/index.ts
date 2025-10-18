import { SQSEvent } from "aws-lambda";
import { IPaymentMessage } from "../../interfaces/payment-message.interface";
import { MESSAGE } from "../../enums/message.enum";
import { dynamoDbProvider } from "../../providers/dynamo-db.provider";
import { ICard } from "../../interfaces/card.interface";
import { IUpdateTransaction } from "../../interfaces/transaction.interface";
import { sqsProvider } from "../../providers/sqs.provider";

export const handler = async (event: SQSEvent): Promise<void> => {
  try {
    for (const record of event.Records) {
      const { type, data }: IPaymentMessage = JSON.parse(record.body);

      const paymentsTablePartitionKeyName = "traceId";

      if (type === MESSAGE.START_PAYMENT) {
        if (
          data.cardBalance! <= 0 ||
          data.cardBalance! < data.service.precio_mensual
        ) {
          await dynamoDbProvider.update<IUpdateTransaction>(
            process.env.PAYMENTS_TABLE_NAME!,
            paymentsTablePartitionKeyName,
            data.traceId,
            {
              status: "FAILED",
              error: "Card does not have enough balance!",
            },
          );

          continue;
        }

        await dynamoDbProvider.update<IUpdateTransaction>(
          process.env.PAYMENTS_TABLE_NAME!,
          paymentsTablePartitionKeyName,
          data.traceId,
          {
            status: "IN PROGRESS",
            timestamp: new Date().toISOString(),
          },
        );

        await sqsProvider.send<IPaymentMessage>(
          process.env.TRANSACTIONS_QUEUE_URL!,
          {
            type: MESSAGE.CHECK_BALANCE,
            data: {
              userId: data.userId,
              cardId: data.cardId,
              cardBalance: data.cardBalance!,
              cardCreatedAt: data.cardCreatedAt!,
              service: data.service,
              traceId: data.traceId,
              timestamp: new Date().toISOString(),
            },
          },
        );
      }
    }
  } catch (error) {
    console.error("🚀 ~ handler ~ error:", error);
    throw error;
  }
};
