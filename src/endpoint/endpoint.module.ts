import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@auth/auth.module';
import { CreateEndpointHandler } from '@endpoint/application/commands/create-endpoint/create-endpoint.handler';
import { DeleteEndpointHandler } from '@endpoint/application/commands/delete-endpoint/delete-endpoint.handler';
import { GetEndpointsHandler } from '@endpoint/application/queries/get-endpoints/get-endpoints.handler';
import { GetEndpointByIdHandler } from '@endpoint/application/queries/get-endpoint-by-id/get-endpoint-by-id.handler';
import { GetEndpointByTokenHandler } from '@endpoint/application/queries/get-endpoint-by-token/get-endpoint-by-token.handler';
import { Token } from '@endpoint/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { EndpointRepository } from '@endpoint/adapters/outbound/persistence/repositories/endpoint.repository';
import { EndpointMapper } from '@endpoint/adapters/outbound/persistence/mappers/endpoint.mapper';
import { EndpointsController } from '@endpoint/adapters/inbound/http/controllers/endpoints.controller';
import { DomainExceptionFilter } from '@endpoint/adapters/inbound/http/filters/domain-exception.filter';
import { BillingModule } from '@billing/billing.module';
import { SubscriptionLimitsGuard } from '@endpoint/adapters/inbound/http/guards/subscription-limits.guard';

const CommandHandlers = [CreateEndpointHandler, DeleteEndpointHandler];
const QueryHandlers = [
  GetEndpointsHandler,
  GetEndpointByIdHandler,
  GetEndpointByTokenHandler,
];

@Module({
  imports: [CqrsModule, ConfigModule, AuthModule, BillingModule],
  controllers: [EndpointsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    EndpointMapper,
    DomainExceptionFilter,
    SubscriptionLimitsGuard,
    {
      provide: Token.EndpointRepository,
      useClass: EndpointRepository,
    },
  ],
  exports: [CqrsModule, Token.EndpointRepository],
})
export class EndpointModule {}
