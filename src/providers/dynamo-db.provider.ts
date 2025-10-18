import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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

  update: async <T extends Record<string, any>>(
    tableName: string,
    partitionKeyName: string,
    partitionKeyValue: string | number,
    dataToUpdate: T,
    sortKeyName?: string,
    sortKeyValue?: string
  ): Promise<any> => {
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.entries(dataToUpdate).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        updateExpressions.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    });

    if (updateExpressions.length === 0)
      throw new Error('No valid fields to update');

    const keyObject: Record<string, any> = {
      [partitionKeyName]: partitionKeyValue,
    };

    if (sortKeyName && sortKeyValue !== undefined) {
      keyObject[sortKeyName] = sortKeyValue;
    }

    try {
      const command = new UpdateCommand({
        TableName: tableName,
        Key: keyObject,
        UpdateExpression: `SET ${updateExpressions.join(', ')}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      });

      const { Attributes } = await dynamoDbClient.send(command);

      return Attributes as T;
    } catch (error) {
      throw error;
    }
  },
};
