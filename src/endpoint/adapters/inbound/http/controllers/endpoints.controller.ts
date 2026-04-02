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
  Patch,
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
import {
  CREATE_ENDPOINT_SCHEMA_SCHEMA,
  CreateEndpiointSchemaDto,
} from '../dto/create-endpoint-schema';
import { CreateEndpointSchemaCommand } from '@endpoint/application/commands/create-endpoint-schema/create-endpoint-schema.command';
import { GetEndpointSchemasQuery } from '@endpoint/application/queries/get-endpoint-schemas/get-endpoint-schemas.query';
import { Page } from '@shared/utils/pagination';
import { EndpointSchema } from '@endpoint/domain/aggregates/endpoint-schema';
import { GetEndpointsSchemasDto } from '../dto/get-endpoint-schemas';
import { CreateEndpointDirectoryCommand } from '@endpoint/application/commands/create-endpoint-directory/create-endpoint-directory.command';
import { UpdateEndpointDirectoryCommand } from '@endpoint/application/commands/update-endpoint-directory/update-endpoint-directory.command';
import { GetEndpointDirectoriesByUserIdQuery } from '@endpoint/application/queries/get-endpoint-directories-by-user-id/get-endpoint-directories-by-user-id.query';
import { GetEndpointDirectoryByIdQuery } from '@endpoint/application/queries/get-endpoint-directory-by-id/get-endpoint-directory-by-id.query';
import type { EndpointDirectoryResponseDto } from '../dto/endpoint-directory-response.dto';
import {
  CreateEndpointDirectoryDto,
  createEndpointDirectorySchema,
} from '../dto/create-endpoint-directory';
import {
  UpdateEndpointDirectoryDto,
  updateEndpointDirectorySchema,
} from '../dto/update-endpoint-directory';
import { GET_ENDPOINT_DIRECTORIES_SCHEME } from '../dto/get-endpoint-directories';
import type { EndpointDirectory } from '@endpoint/domain/aggregates/endpoint-directory';
import { generateUUID } from '@shared/utils/generate-uuid';
import { randomBytes } from 'crypto';
import { GetEndpointsDto } from '../dto/get-endpoints';

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

function toEndpointDirectoryResponseDto(
  directory: EndpointDirectory,
): EndpointDirectoryResponseDto {
  const json = directory.toJSON();
  return {
    id: json.id,
    userId: json.userId,
    name: json.name,
    description: json.description ?? null,
    endpoints: json.endpoints,
    color: json.color ?? null,
    icon: json.icon ?? null,
    createdAt: json.createdAt?.toISOString() ?? null,
    updatedAt: json.updatedAt?.toISOString() ?? null,
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
    @Query() query: GetEndpointsDto,
  ): Promise<EndpointResponseDto[]> {
    const endpoints = (await this.queryBus.execute(
      new GetEndpointsQuery({ userId: user.userId, ...query }),
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
      token,
      isActive,
      targetUrl,
      secretKey,
      provider,
      silenceTreshold,
      directoryId,
    } = parsed.data;
    const endpointId = await this.commandBus.execute(
      new CreateEndpointCommand({
        userId: user.userId,
        name,
        description,
        isActive,
        silenceTreshold,
        token,
        directoryId,
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

  @Post('before/create')
  async beforeCreate(): Promise<{ token: string }> {
    return { token: randomBytes(16).toString('hex') };
  }

  @Get('directories')
  async listDirectories(
    @Query() query: Record<string, string | undefined>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Page<EndpointDirectoryResponseDto>> {
    const parsed = GET_ENDPOINT_DIRECTORIES_SCHEME.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const page = (await this.queryBus.execute(
      new GetEndpointDirectoriesByUserIdQuery({
        userId: user.userId,
        filters: {
          limit: parsed.data.limit,
          offset: parsed.data.offset,
          orderBy: parsed.data.orderBy,
          orderByField: parsed.data.orderByField,
        },
      }),
    )) as Page<EndpointDirectory>;

    console.log(`PAGE DATA: `, page.data);

    return {
      ...page,
      data: page.data.map(toEndpointDirectoryResponseDto),
    };
  }

  @Post('directories')
  async createDirectory(
    @Body() body: CreateEndpointDirectoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointDirectoryResponseDto> {
    const parsed = createEndpointDirectorySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const directoryId = await this.commandBus.execute(
      new CreateEndpointDirectoryCommand({
        id: generateUUID(),
        userId: user.userId,
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        icon: parsed.data.icon,
      }),
    );
    const directory = (await this.queryBus.execute(
      new GetEndpointDirectoryByIdQuery({
        userId: user.userId,
        directoryId,
      }),
    )) as EndpointDirectory;

    return toEndpointDirectoryResponseDto(directory);
  }

  @Get('directories/:directoryId')
  async getDirectoryById(
    @Param('directoryId') directoryId: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointDirectoryResponseDto> {
    const directory = (await this.queryBus.execute(
      new GetEndpointDirectoryByIdQuery({
        userId: user.userId,
        directoryId,
      }),
    )) as EndpointDirectory;

    return toEndpointDirectoryResponseDto(directory);
  }

  @Patch('directories/:directoryId')
  async updateDirectory(
    @Param('directoryId') directoryId: string,
    @Body() body: UpdateEndpointDirectoryDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointDirectoryResponseDto> {
    const parsed = updateEndpointDirectorySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    await this.commandBus.execute(
      new UpdateEndpointDirectoryCommand({
        userId: user.userId,
        directoryId,
        name: parsed.data.name,
        description: parsed.data.description,
        color: parsed.data.color,
        icon: parsed.data.icon,
      }),
    );

    const directory = (await this.queryBus.execute(
      new GetEndpointDirectoryByIdQuery({
        userId: user.userId,
        directoryId,
      }),
    )) as EndpointDirectory;

    return toEndpointDirectoryResponseDto(directory);
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
    const parsed = CREATE_ENDPOINT_SCHEMA_SCHEMA.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const { endpointId, eventType, targets } = parsed.data;
    return await this.commandBus.execute(
      new CreateEndpointSchemaCommand({
        endpointId,
        eventType,
        targets,
      }),
    );
  }
}
