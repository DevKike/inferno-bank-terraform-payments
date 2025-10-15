import { APIGatewayProxyEvent } from 'aws-lambda';

export interface IStartPaymentEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  body: {
    userId: string;
    cardId: string;
    service: Record<string, any>;
    status: string;
    traceId: string;
    timestamp: string;
  };
}
