import { Module } from '@nestjs/common';
import { Token } from '@retry/constants';
import { RetryMapper } from '@retry/adapters/outbound/persistence/mappers/retry.mapper';
import { RetryRepository } from '@retry/adapters/outbound/persistence/repositories/retry.repository';
import { BullModule } from '@nestjs/bullmq';
import { CqrsModule } from '@nestjs/cqrs';
import { ForwardFailedListener } from '@request/application/listeners/forward-failed.listener';
import { RetryQueueProducer } from '@retry/adapters/outbound/queue/producers/retry.queue.producer';
import { RetryQueueProcessor } from '@retry/adapters/outbound/queue/producers/retry.queue.processor';
import {
  HttpClientProvider,
  HttpService as HttpServiceProvider,
} from '@shared/constants';
import { HttpClient } from '@shared/adapters/outbound/http.client';
import { HttpService } from '@shared/adapters/outbound/http.service';
import { RequestModule } from '@request/request.module';
import { AuthModule } from '@auth/auth.module';
import { RetriesController } from '@retry/adapters/inbound/http/controllers/retries.controller';
import { DomainExceptionFilter } from '@retry/adapters/inbound/http/filters/domain-exception.filter';
import { GetRetriesHandler } from '@retry/application/queries/get-retries/get-retries.handler';
import { GetRetryByIdHandler } from '@retry/application/queries/get-retry-by-id/get-retry-by-id.handler';
import { RunRetryManuallyHandler } from '@retry/application/commands/run-retry-manually/run-retry-manually.handler';
import { UpdateRetryPayloadHandler } from '@retry/application/commands/update-retry-payload/update-retry-payload.handler';

import { RequestMapper } from '@request/adapters/outbound/persistence/mappers/request.mapper';

@Module({
  imports: [
    CqrsModule,
    RequestModule,
    AuthModule,
    BullModule.registerQueue({
      name: 'retry',
    }),
  ],
  controllers: [RetriesController],
  providers: [
    RetryMapper,
    RequestMapper,
    ForwardFailedListener,
    RetryQueueProcessor,
    GetRetriesHandler,
    GetRetryByIdHandler,
    RunRetryManuallyHandler,
    UpdateRetryPayloadHandler,
    DomainExceptionFilter,
    {
      provide: Token.RetryRepository,
      useClass: RetryRepository,
    },
    {
      provide: Token.RetryQueue,
      useClass: RetryQueueProducer,
    },
    {
      provide: HttpClientProvider,
      useClass: HttpClient,
    },
    {
      provide: HttpServiceProvider,
      useClass: HttpService,
    },
  ],
  exports: [CqrsModule, Token.RetryRepository, Token.RetryQueue, RetryMapper],
})
export class RetryModule {}
