import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.APP_REGION!,
});

export const dynamoDbProvider = {
  save: async <T extends Record<string, any>>(
    tableName: string,
    data: T
  ): Promise<void> => {
    const command = new PutCommand({
      TableName: tableName,
      Item: data,
    });

    try {
      await dynamoDbClient.send(command);
    } catch (error) {
      throw error;
    }
  },

  getByPartitionKey: async <T>(
    tableName: string,
    partitionKeyName: string,
    partitionKeyValue: string
  ): Promise<T> => {
    const command = new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: '#pk = :pkval',
      ExpressionAttributeNames: { '#pk': partitionKeyName },
      ExpressionAttributeValues: { ':pkval': partitionKeyValue },
      Limit: 1,
    });

    try {
      const { Items } = await dynamoDbClient.send(command);

      if (!Items || Items?.length === 0)
        throw new Error(`Values by key: ${partitionKeyName} were not found`);

      return Items[0] as T;
    } catch (error) {
      throw error;
    }
  },
};
