import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@auth/auth.module';
import { CreateWaitlistEntryHandler } from '@waitlist/application/commands/create-waitlist-entry/create-waitlist-entry.handler';
import { Token } from '@waitlist/constants';
import { WaitlistRepository } from '@waitlist/adapters/outbound/persistence/repositories/waitlist.repository';
import { WaitlistMapper } from '@waitlist/adapters/outbound/persistence/mappers/waitlist.mapper';
import { WaitlistController } from '@waitlist/adapters/inbound/http/controllers/waitlist.controller';
import { DomainExceptionFilter } from '@waitlist/adapters/inbound/http/filters/domain-exception.filter';

const CommandHandlers = [CreateWaitlistEntryHandler];

@Module({
  imports: [CqrsModule, AuthModule],
  controllers: [WaitlistController],
  providers: [
    ...CommandHandlers,
    WaitlistMapper,
    DomainExceptionFilter,
    {
      provide: Token.WaitlistRepository,
      useClass: WaitlistRepository,
    },
  ],
  exports: [CqrsModule, Token.WaitlistRepository],
})
export class WaitlistModule {}
