import { ICommand } from '@nestjs/cqrs';

export class RegisterAccountUnitCommand implements ICommand {
  constructor(
    public readonly aggregateId: string,
    public readonly paymentMechanismCount: string,
  ) {}
}

export class DisableAccountUnitCommand implements ICommand {
  constructor(public readonly aggregateId: string) {}
}

export class EnableAccountUnitCommand implements ICommand {
  constructor(public readonly aggregateId: string) {}
}
