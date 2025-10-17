import { PAYMENT_STATUS } from '../types/payment-status.type';
import { IService } from './service.interface';

export interface ITransaction {
  userId: string;
  cardId: string;
  service: IService;
  traceId: string;
  status: PAYMENT_STATUS;
  error?: string;
  timestamp: string;
}

export interface IUpdateTransaction extends Partial<ITransaction> {}
