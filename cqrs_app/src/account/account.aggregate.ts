import {
  AggregateRoot,
  CommandHandler,
  EventPublisher,
  EventsHandler,
  ICommandHandler,
  IEventHandler,
} from '@nestjs/cqrs';
import {
  DisableAccountUnitCommand,
  EnableAccountUnitCommand,
  RegisterAccountUnitCommand,
} from './account.commands';
import { jsonEvent } from '@eventstore/db-client';
import { client as eventStore } from '../eventstore';
import {
  AccountDisableEvent,
  AccountEnableEvent,
  AccountRegisterEvent,
} from './account.events';

interface AccountEvent {
  aggregateId: string;
  paymentMechanismCount: string;
}

async function handleAccountEvent(eventType: string, event: AccountEvent) {
  const eventData = jsonEvent({
    type: eventType,
    data: {
      id: event.aggregateId,
      paymentMechanismCount: event.paymentMechanismCount,
    },
  });
  await eventStore.appendToStream('Account-unit-stream-' + event.aggregateId, [
    eventData,
  ]);
}

export class AccountAggregate extends AggregateRoot {
  private id: string;
  private paymentMechanismCount: string;
  disabled: boolean = false;

  enableAccount(): void {
    if (this.disabled) {
      this.apply(new AccountEnableEvent(this.id, this.paymentMechanismCount));
    }
  }

  disableAccount() {
    if (!this.disabled) {
      this.apply(new AccountDisableEvent(this.id, this.paymentMechanismCount));
    }
  }

  accountDisabled() {
    this.disabled = true;
  }

  accountEnabled() {
    this.disabled = false;
  }

  applyAccountRegisteredEventToAggregate(event: AccountRegisterEvent): void {
    this.id = event.aggregateId;
    this.paymentMechanismCount = event.paymentMechanismCount;
    this.disabled = false;
  }

  static async loadAggregate(aggregateId: string): Promise<AccountAggregate> {
    const events = eventStore.readStream('Account-unit-stream' + aggregateId);
    // let count = 0;
    const aggregate = new AccountAggregate();
    for await (const event of events) {
      const eventData: any = event.event.data;
      try {
        switch (event.event.type) {
          case 'AccountUnitCreated':
            aggregate.applyAccountRegisteredEventToAggregate({
              aggregateId: eventData.id,
              paymentMechanismCount: eventData.paymentMechanismCount,
            });
            break;
          case 'AccountUnitDisabled':
            aggregate.accountDisabled();
            break;
          case 'AccountUnitEnabled':
            aggregate.accountEnabled();
            break;
          default:
            break;
        }
      } catch (error) {
        console.error(error);
        console.error('Could not process event');
      }
      // count++;
    }
    return aggregate;
  }

  registerAccount(aggregateId: string, paymentMechanismCount: string) {
    this.apply(new AccountRegisterEvent(aggregateId, paymentMechanismCount));
  }
}

@CommandHandler(RegisterAccountUnitCommand)
export class RegisterAccountUnitHandler
  implements ICommandHandler<RegisterAccountUnitCommand>
{
  constructor(private readonly publisher: EventPublisher) {}

  async execute(command: RegisterAccountUnitCommand): Promise<any> {
    const aggregate = this.publisher.mergeObjectContext(new AccountAggregate());
    aggregate.registerAccount(
      command.aggregateId,
      command.paymentMechanismCount,
    );
    aggregate.commit();
  }
}

@CommandHandler(DisableAccountUnitCommand)
export class DisableAccountUnitHandler
  implements ICommandHandler<DisableAccountUnitCommand>
{
  constructor(private readonly publisher: EventPublisher) {}
  async execute(command: DisableAccountUnitCommand): Promise<any> {
    const aggregate = this.publisher.mergeObjectContext(
      await AccountAggregate.loadAggregate(command.aggregateId),
    );
    if (!aggregate.disabled) {
      aggregate.disableAccount();
      aggregate.commit();
    }
  }
}

@CommandHandler(EnableAccountUnitCommand)
export class EnableAccountUnitHandler
  implements ICommandHandler<EnableAccountUnitCommand>
{
  constructor(private readonly publisher: EventPublisher) {}

  async execute(command: EnableAccountUnitCommand): Promise<any> {
    const aggregate = this.publisher.mergeObjectContext(
      await AccountAggregate.loadAggregate(command.aggregateId),
    );
    if (aggregate.disabled) {
      aggregate.enableAccount();
      aggregate.commit();
    }
  }
}

@EventsHandler(AccountRegisterEvent)
export class AccountRegisteredEventHandler
  implements IEventHandler<AccountRegisterEvent>
{
  async handle(event: AccountRegisterEvent) {
    await handleAccountEvent('AccountUnitCreated', event);
  }
}

@EventsHandler(AccountDisableEvent)
export class AccountDisabledEventHandler
  implements IEventHandler<AccountDisableEvent>
{
  async handle(event: AccountDisableEvent) {
    await handleAccountEvent('AccountUnitDisabled', event);
  }
}

@EventsHandler(AccountEnableEvent)
export class AccountEnableEventHandler
  implements IEventHandler<AccountEnableEvent>
{
  async handle(event: AccountEnableEvent) {
    await handleAccountEvent('AccountUnitEnable', event);
  }
}
