import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({
  region: process.env.APP_REGION!,
});

export const dynamoDbProvider = {
  getByPartitionKey: async <T>(
    tableName: string,
    partitionKeyName: string,
    partitionKeyValue: string
  ): Promise<T> => {
    try {
      const command = new QueryCommand({
        TableName: tableName,
        KeyConditionExpression: '#pk = :pkval',
        ExpressionAttributeNames: { '#pk': partitionKeyName },
        ExpressionAttributeValues: { ':pkval': partitionKeyValue },
        Limit: 1,
      });

      const { Items } = await dynamoDbClient.send(command);

      if (!Items || Items?.length === 0)
        throw new Error(`Values by key: ${partitionKeyName} were not found`);

      return Items[0] as T;
    } catch (error) {
      throw error;
    }
  },
};
