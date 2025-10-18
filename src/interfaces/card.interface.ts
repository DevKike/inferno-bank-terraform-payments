export interface ICard {
  uuid: string;
  balance: number;
  status: string;
  type: string;
  userId: string;
  createdAt: string;
}

export interface IUpdateCard extends Partial<ICard> {}
