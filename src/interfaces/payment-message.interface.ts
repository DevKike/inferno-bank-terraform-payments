import { MESSAGE } from '../enums/message.enum';
import { PAYMENT_STATUS } from '../types/payment-status.type';
import { IService } from './service.interface';

export interface IPaymentMessage {
  type: MESSAGE;
  data: {
    userId: string;
    cardId: string;
    service: IService;
    traceId: string;
    timestamp: string;
  };
}
