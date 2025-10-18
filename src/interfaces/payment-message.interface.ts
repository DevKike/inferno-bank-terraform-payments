import { MESSAGE } from '../enums/message.enum';
import { IService } from './service.interface';

export interface IPaymentMessage {
  type: MESSAGE;
  data: {
    userId: string;
    cardId: string;
    cardBalance?: number;
    cardCreatedAt?: string,
    service: IService;
    traceId: string;
    timestamp: string;
  };
}
