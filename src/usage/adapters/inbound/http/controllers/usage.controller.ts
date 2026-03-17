import { Controller, Get, UseGuards } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { GetUsageStatsQuery } from '@usage/application/queries/get-usage-stats/get-usage-stats.query';
import type { UsageStatsResponseDto } from '../dto/usage-stats-response.dto';

@Controller('usage')
@UseGuards(AuthGuard)
export class UsageController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('stats')
  async getStats(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UsageStatsResponseDto> {
    return (await this.queryBus.execute(
      new GetUsageStatsQuery({ userId: user.userId }),
    )) as UsageStatsResponseDto;
  }
}

