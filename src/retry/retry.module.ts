import { Module } from '@nestjs/common';
import { RETRY_REPOSITORY } from '@retry/domain/retry.repository';
import { RetryRepositoryImpl } from '@retry/infrastructure/persistence/retry.repository.impl';

@Module({
  providers: [
    {
      provide: RETRY_REPOSITORY,
      useClass: RetryRepositoryImpl,
    },
  ],
  exports: [RETRY_REPOSITORY],
})
export class RetryModule {}
