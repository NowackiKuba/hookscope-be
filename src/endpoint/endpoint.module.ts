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
import { UserSettingsModule } from '@user-settings/user-settings.module';
import { SubscriptionLimitsGuard } from '@endpoint/adapters/inbound/http/guards/subscription-limits.guard';
import { EndpointSchemaRepository } from '@endpoint/adapters/outbound/persistence/repositories/endpoint-schema.repository';
import { EndpointSchemaMapper } from '@endpoint/adapters/outbound/persistence/mappers/endpoint-schema.mapper';
import { CreateEndpointSchemaHandler } from './application/commands/create-endpoint-schema/create-endpoint-schema.handler';
import { AIService } from '@shared/constants';
import { AiService } from '@shared/adapters/outbound/ai.service';
import { GetEndpointSchemasHandler } from './application/queries/get-endpoint-schemas/get-endpoint-schemes.handler';
import { EndpointSchemaCodeGenerationService } from './application/services/endpoint-schema-code-generation.service';
import { EndpointDirectoryRepository } from './adapters/outbound/persistence/repositories/endpoint-directory.repository';
import { EndpointDirectoryMapper } from './adapters/outbound/persistence/mappers/endpoint-directory.mapper';
import { CreateEndpointDirectoryHandler } from './application/commands/create-endpoint-directory/create-endpoint-directory.handler';

const CommandHandlers = [
  CreateEndpointHandler,
  DeleteEndpointHandler,
  CreateEndpointSchemaHandler,
  CreateEndpointDirectoryHandler,
];
const QueryHandlers = [
  GetEndpointsHandler,
  GetEndpointByIdHandler,
  GetEndpointByTokenHandler,
  GetEndpointSchemasHandler,
];

@Module({
  imports: [
    CqrsModule,
    ConfigModule,
    AuthModule,
    BillingModule,
    UserSettingsModule,
  ],
  controllers: [EndpointsController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    EndpointMapper,
    EndpointDirectoryMapper,
    EndpointSchemaMapper,
    EndpointSchemaCodeGenerationService,
    DomainExceptionFilter,
    SubscriptionLimitsGuard,
    {
      provide: Token.EndpointRepository,
      useClass: EndpointRepository,
    },
    {
      provide: AIService,
      useClass: AiService,
    },
    {
      provide: Token.EndpointSchemaRepository,
      useClass: EndpointSchemaRepository,
    },
    {
      provide: Token.EndpointDirectoryRepository,
      useClass: EndpointDirectoryRepository,
    },
  ],
  exports: [
    CqrsModule,
    EndpointDirectoryMapper,
    Token.EndpointRepository,
    Token.EndpointDirectoryRepository,
    Token.EndpointSchemaRepository,
    EndpointSchemaCodeGenerationService,
  ],
})
export class EndpointModule {}
