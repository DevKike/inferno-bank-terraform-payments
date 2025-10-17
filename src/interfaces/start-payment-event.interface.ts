import { APIGatewayProxyEvent } from 'aws-lambda';
import { IService } from './service.interface';

export interface IStartPaymentEvent extends Omit<APIGatewayProxyEvent, 'body'> {
  body: {
    userId: string;
    cardId: string;
    service: IService;
    status: string;
    traceId: string;
    timestamp: string;
  };
}
