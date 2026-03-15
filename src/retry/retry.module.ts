import { Module } from '@nestjs/common';
import { Token } from '@retry/constants';
import { RetryMapper } from '@retry/adapters/outbound/persistence/mappers/retry.mapper';
import { RetryRepository } from '@retry/adapters/outbound/persistence/repositories/retry.repository';

@Module({
  providers: [
    RetryMapper,
    {
      provide: Token.RetryRepository,
      useClass: RetryRepository,
    },
  ],
  exports: [Token.RetryRepository, RetryMapper],
})
export class RetryModule {}
