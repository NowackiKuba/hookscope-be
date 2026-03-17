import {
  Body,
  Controller,
  Get,
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
import { GetRetriesQueue } from '@retry/application/queries/get-retries/get-retries.queue';
import { GetRetryByIdQuery } from '@retry/application/queries/get-retry-by-id/get-retry-by-id.query';
import { RunRetryManuallyCommand } from '@retry/application/commands/run-retry-manually/run-retry-manually.command';
import type { GetRetriesInput } from '../dto/get-retries';
import type { RunRetryManuallyInput } from '../dto/run-retry-manually';
import {
  toRetryResponseDto,
  type RetryResponseDto,
} from '../dto/retry-response.dto';
import type { Page } from '@shared/utils/pagination';
import type { Retry } from '@retry/domain/aggregates/retry';

@Controller('retries')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class RetriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async list(
    @Query() query: GetRetriesInput & { userId?: string },
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<Page<Retry>> {
    const result = (await this.queryBus.execute(
      new GetRetriesQueue({
        ...query,
        userId: user.userId,
      }),
    )) as Page<Retry>;
    return result;
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<RetryResponseDto> {
    const retry = (await this.queryBus.execute(
      new GetRetryByIdQuery(id, user.userId),
    )) as Retry;
    return toRetryResponseDto(retry);
  }

  @Post(':id/run')
  async runManually(
    @Param('id') id: string,
    @Body() body: RunRetryManuallyInput,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ scheduled: boolean }> {
    return this.commandBus.execute(
      new RunRetryManuallyCommand(id, user.userId, body.body, body.headers),
    );
  }
}
