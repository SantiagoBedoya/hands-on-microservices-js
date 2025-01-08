import { IEvent } from '@nestjs/cqrs';

export class AccountEvent implements IEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly paymentMechanismCount: string,
  ) {}
}

export class AccountRegisterEvent extends AccountEvent {}
export class AccountDisableEvent extends AccountEvent {}
export class AccountEnableEvent extends AccountEvent {}
