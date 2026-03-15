import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@auth/auth.module';
import { EndpointModule } from '@endpoint/endpoint.module';
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

const CommandHandlers = [ReceiveRequestHandler, DeleteRequestHandler];
const QueryHandlers = [
  GetRequestsHandler,
  GetRequestByIdHandler,
  GetRequestsByUserIdHandler,
];

@Module({
  imports: [CqrsModule, AuthModule, EndpointModule],
  controllers: [RequestsController, HooksController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    RequestMapper,
    DomainExceptionFilter,
    {
      provide: Token.RequestRepository,
      useClass: RequestRepository,
    },
  ],
  exports: [CqrsModule, Token.RequestRepository],
})
export class RequestModule {}
