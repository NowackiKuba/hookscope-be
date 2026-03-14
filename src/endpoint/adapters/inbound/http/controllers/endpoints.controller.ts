import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
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
import type { Endpoint } from '@endpoint/domain/aggregates/endpoint';

function toResponseDto(endpoint: Endpoint, appUrl: string): EndpointResponseDto {
  const json = endpoint.toJSON();
  return {
    id: json.id,
    userId: json.userId,
    name: json.name,
    description: '',
    token: json.token,
    isActive: true,
    targetUrl: null,
    requestCount: 0,
    lastRequestAt: null,
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
  ) {}

  @Get()
  async list(@CurrentUser() user: AuthenticatedUser): Promise<EndpointResponseDto[]> {
    const endpoints = await this.queryBus.execute(
      new GetEndpointsQuery({ userId: user.userId }),
    ) as Endpoint[];
    const appUrl = this.configService.get('APP_URL', { infer: true });
    return endpoints.map((e) => toResponseDto(e, appUrl));
  }

  @Post()
  async create(
    @Body() body: { name: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<EndpointResponseDto> {
    const endpointId = await this.commandBus.execute(
      new CreateEndpointCommand({ userId: user.userId, name: body.name }),
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
}
