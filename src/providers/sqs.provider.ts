import { SendMessageCommand, SQSClient } from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.APP_REGION! });

export const sqsProvider = {
  send: async <T>(queueUrl: string, data: T): Promise<void> => {
    try {
      const command = new SendMessageCommand({
        QueueUrl: queueUrl,
        MessageBody: JSON.stringify(data),
      });

      await sqsClient.send(command);
    } catch (error) {
      console.error('🚀 ~ error:', error);
      throw error;
    }
  },
};
