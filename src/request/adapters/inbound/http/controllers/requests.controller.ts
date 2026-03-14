import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { DeleteRequestCommand } from '@request/application/commands/delete-request/delete-request.command';
import { GetRequestsQuery } from '@request/application/queries/get-requests/get-requests.query';
import { GetRequestByIdQuery } from '@request/application/queries/get-request-by-id/get-request-by-id.query';
import type { RequestResponseDto } from '../dto/request-response.dto';
import type { GetRequestsResult } from '@request/application/queries/get-requests/get-requests.handler';
import type { Request } from '@request/domain/aggregates/request';

function toResponseDto(
  item: GetRequestsResult['data'][number],
): RequestResponseDto {
  return {
    id: item.id,
    endpointId: item.endpointId,
    method: item.method,
    headers: item.headers,
    body: item.body,
    query: item.query,
    ip: item.ip,
    contentType: item.contentType,
    size: item.size,
    overlimit: item.overlimit,
    forwardStatus: item.forwardStatus,
    forwardedAt: item.forwardedAt,
    forwardError: item.forwardError,
    receivedAt: item.receivedAt,
  };
}

@Controller('requests')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class RequestsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('endpointId') endpointId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ): Promise<{ data: RequestResponseDto[]; total: number; limit: number; offset: number }> {
    const limitNum = Math.min(Number(limit) || 20, 100);
    const offsetNum = Number(offset) || 0;
    const result = await this.queryBus.execute(
      new GetRequestsQuery({
        userId: user.userId,
        endpointId,
        limit: limitNum,
        offset: offsetNum,
      }),
    ) as GetRequestsResult;
    return {
      data: result.data.map(toResponseDto),
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    };
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RequestResponseDto> {
    const request = await this.queryBus.execute(
      new GetRequestByIdQuery({ userId: user.userId, requestId: id }),
    ) as Request;
    const json = request.toJSON();
    return toResponseDto({
      id: json.id,
      endpointId: json.endpointId,
      method: json.method,
      headers: json.headers,
      body: json.body,
      query: json.query,
      ip: json.ip,
      contentType: json.contentType,
      size: json.size,
      overlimit: json.overlimit,
      forwardStatus: json.forwardStatus ?? null,
      forwardedAt: json.forwardedAt?.toISOString() ?? null,
      forwardError: json.forwardError ?? null,
      receivedAt: json.receivedAt.toISOString(),
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<void> {
    await this.commandBus.execute(
      new DeleteRequestCommand({ userId: user.userId, requestId: id }),
    );
  }
}
