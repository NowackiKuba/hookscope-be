import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Param,
  Post,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { CreateEndpointCommand } from '@endpoint/application/commands/create-endpoint/create-endpoint.command';
import { DeleteEndpointCommand } from '@endpoint/application/commands/delete-endpoint/delete-endpoint.command';
import { GetEndpointsQuery } from '@endpoint/application/queries/get-endpoints/get-endpoints.query';
import { GetEndpointByIdQuery } from '@endpoint/application/queries/get-endpoint-by-id/get-endpoint-by-id.query';
import { ConfigService } from '@nestjs/config';
import type { Config } from '@config/config.schema';
import type { EndpointResponseDto } from '../dto/endpoint-response.dto';
import {
  CreateEndpointDto,
  createEndpointSchema,
} from '../dto/create-endpoint';
import type { Endpoint } from '@endpoint/domain/aggregates/endpoint';
import { SubscriptionLimitsGuard } from '../guards/subscription-limits.guard';
import { Token } from '@endpoint/constants';
import { EndpointSchemaRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint-schema.repository.port';
import { CreateEndpiointSchemaDto } from '../dto/create-endpoint-schema';
import { CreateEndpointSchemaCommand } from '@endpoint/application/commands/create-endpoint-schema/create-endpoint-schema.command';
import { GetEndpointSchemasQuery } from '@endpoint/application/queries/get-endpoint-schemas/get-endpoint-schemas.query';
import { Page } from '@shared/utils/pagination';
import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import { GetEndpointsSchemasDto } from '../dto/get-endpoint-schemas';

function toResponseDto(
  endpoint: Endpoint,
  appUrl: string,
): EndpointResponseDto {
  const json = endpoint.toJSON();
  return {
    id: json.id,
    userId: json.userId,
    name: json.name,
    description: json.description,
    token: json.token,
    isActive: json.isActive,
    targetUrl: json.targetUrl,
    silenceTreshold: json.silenceTreshold,
    requestCount: json.requestCount,
    lastRequestAt: json.lastRequestAt?.toISOString() ?? null,
    webhookUrl: `${appUrl}/hooks/${json.token}`,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}

@Controller('endpoints')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class EndpointsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly configService: ConfigService<Config, true>,
    @Inject(Token.EndpointSchemaRepository)
    private readonly endpointSchemaRepository: EndpointSchemaRepositoryPort,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointResponseDto[]> {
    const endpoints = (await this.queryBus.execute(
      new GetEndpointsQuery({ userId: user.userId }),
    )) as Endpoint[];
    const appUrl = this.configService.get('APP_URL', { infer: true });
    return endpoints.map((e) => toResponseDto(e, appUrl));
  }

  @Post()
  @UseGuards(SubscriptionLimitsGuard)
  async create(
    @Body() body: CreateEndpointDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointResponseDto> {
    const parsed = createEndpointSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const {
      name,
      description,
      isActive,
      targetUrl,
      secretKey,
      provider,
      silenceTreshold,
    } = parsed.data;
    const endpointId = await this.commandBus.execute(
      new CreateEndpointCommand({
        userId: user.userId,
        name,
        description,
        isActive,
        silenceTreshold,
        targetUrl,
        provider,
        secretKey,
      }),
    );
    const endpoint = await this.queryBus.execute(
      new GetEndpointByIdQuery({ userId: user.userId, endpointId }),
    );
    const appUrl = this.configService.get('APP_URL', { infer: true });
    return toResponseDto(endpoint, appUrl);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointResponseDto> {
    const endpoint = await this.queryBus.execute(
      new GetEndpointByIdQuery({ userId: user.userId, endpointId: id }),
    );
    const appUrl = this.configService.get('APP_URL', { infer: true });
    return toResponseDto(endpoint, appUrl);
  }

  @Get(':id/schemas')
  async getSchemas(
    @Param('id') id: string,
    @Query() query: GetEndpointsSchemasDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Page<EndpointSchema>> {
    return await this.queryBus.execute(
      new GetEndpointSchemasQuery({
        ...query,
        endpointId: id,
        userId: user.userId,
      }),
    );
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteEndpointCommand({ userId: user.userId, endpointId: id }),
    );
  }

  @Post('/schemas')
  async createSchema(@Body() body: CreateEndpiointSchemaDto) {
    return await this.commandBus.execute(
      new CreateEndpointSchemaCommand({
        endpointId: body.endpointId,
        schema: body.schema,
      }),
    );
  }
}
