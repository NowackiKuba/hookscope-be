import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { BullModule } from '@nestjs/bullmq';
import { AuthModule } from '@auth/auth.module';
import { EndpointModule } from '@endpoint/endpoint.module';
import { BillingModule } from '@billing/billing.module';
import { ReceiveRequestHandler } from '@request/application/commands/receive-request/receive-request.handler';
import { DeleteRequestHandler } from '@request/application/commands/delete-request/delete-request.handler';
import { GetRequestsHandler } from '@request/application/queries/get-requests/get-requests.handler';
import { GetRequestByIdHandler } from '@request/application/queries/get-request-by-id/get-request-by-id.handler';
import { Token } from '@request/constants';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { RequestRepository } from '@request/adapters/outbound/persistence/repositories/request.repository';
import { RequestMapper } from '@request/adapters/outbound/persistence/mappers/request.mapper';
import { RequestsController } from '@request/adapters/inbound/http/controllers/requests.controller';
import { HooksController } from '@request/adapters/inbound/http/controllers/hooks.controller';
import { DomainExceptionFilter } from '@request/adapters/inbound/http/filters/domain-exception.filter';
import { GetRequestsByUserIdHandler } from './application/queries/get-requests-by-user-id/get-requests-by-user-id.handler';
import {
  HttpClientProvider,
  HttpService as HttpServiceProvider,
} from '@shared/constants';
import { HttpClient } from '@shared/adapters/outbound/http.client';
import { HttpService } from '@shared/adapters/outbound/http.service';
import { CleanupOldRequestsScheduler } from '@request/adapters/inbound/cron/cleanup-old-requests.scheduler';
import { RequestCleanupQueueProducer } from '@request/adapters/outbound/queue/producers/request-cleanup.queue.producer';
import { RequestCleanupQueueProcessor } from '@request/adapters/outbound/queue/processors/request-cleanup.queue.processor';
import { RunRequestCleanupHandler } from '@request/application/commands/run-request-cleanup/run-request-cleanup.handler';
import { ForwardRequestQueueProducer } from '@request/adapters/outbound/queue/producers/forward-request.queue.producer';
import { ForwardRequestQueueProcessor } from '@request/adapters/outbound/queue/processors/forward-request.queue.processor';

const CommandHandlers = [
  ReceiveRequestHandler,
  DeleteRequestHandler,
  RunRequestCleanupHandler,
];
const QueryHandlers = [
  GetRequestsHandler,
  GetRequestByIdHandler,
  GetRequestsByUserIdHandler,
];

@Module({
  imports: [
    CqrsModule,
    AuthModule,
    EndpointModule,
    BillingModule,
    BullModule.registerQueue({
      name: 'request-cleanup',
    }),
    BullModule.registerQueue({
      name: 'forward',
    }),
  ],
  controllers: [RequestsController, HooksController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    RequestMapper,
    DomainExceptionFilter,
    CleanupOldRequestsScheduler,
    RequestCleanupQueueProcessor,
    ForwardRequestQueueProcessor,
    {
      provide: Token.RequestRepository,
      useClass: RequestRepository,
    },
    {
      provide: Token.RequestCleanupQueue,
      useClass: RequestCleanupQueueProducer,
    },
    {
      provide: Token.ForwardRequestQueue,
      useClass: ForwardRequestQueueProducer,
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
  exports: [
    CqrsModule,
    Token.RequestRepository,
    Token.RequestCleanupQueue,
    Token.ForwardRequestQueue,
  ],
})
export class RequestModule {}
