import {
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

const sqsClient = new SQSClient({ region: process.env.APP_REGION! });

export const sqsProvider = {
  send: async (queueUrl: string, data: Record<string, any>): Promise<void> => {
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

  receive: async (queueUrl: string) => {
    try {
      const command = new ReceiveMessageCommand({
        QueueUrl: queueUrl,
      });

      await sqsClient.send(command);
    } catch (error) {
      console.error('🚀 ~ error:', error);
      throw error;
    }
  },
};
