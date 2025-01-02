interface Account {
  name: string;
  number: string;
  type: 'root' | 'sub';
  status: 'new' | 'active' | 'inactive' | 'blocked';
  createdAt: Date;
  updatedAt?: Date;
}

export class AccountAPIResponse {
  success: boolean;
  account: Account;

  constructor(success: boolean, account: Account) {
    this.success = success;
    this.account = account;
  }
}
