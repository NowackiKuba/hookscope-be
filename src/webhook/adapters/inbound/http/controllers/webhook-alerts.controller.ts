import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { GetWebhookAlertsQuery } from '@webhook/application/queries/get-webhook-alerts/get-webhook-alerts.query';
import { GetWebhookAlertByIdQuery } from '@webhook/application/queries/get-webhook-alert-by-id/get-webhook-alert-by-id.query';
import { GET_WEBHOOK_ALERTS_SCHEMA } from '../dto/get-webhook-alerts/get-webhook-alerts.schema';
import type {
  PaginatedWebhookAlertsResponseDto,
  WebhookAlertResponseDto,
} from '../dto/webhook-alert-response.dto';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import {
  toPaginatedWebhookAlertsResponseDto,
  toWebhookAlertResponseDto,
} from '../mappers/webhook-alert-response.mapper';

@Controller('webhook-alerts')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class WebhookAlertsController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get()
  async list(
    @Query() query: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedWebhookAlertsResponseDto> {
    const parsed = GET_WEBHOOK_ALERTS_SCHEMA.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const {
      limit,
      offset,
      orderBy,
      orderByField,
      type,
      status,
      endpointId,
    } = parsed.data;

    const page = await this.queryBus.execute(
      new GetWebhookAlertsQuery({
        userId: user.userId,
        limit,
        offset,
        orderBy,
        orderByField,
        type,
        status,
        endpointId,
      }),
    );

    return toPaginatedWebhookAlertsResponseDto(page);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<WebhookAlertResponseDto> {
    const alert = await this.queryBus.execute(
      new GetWebhookAlertByIdQuery({ userId: user.userId, alertId: id }),
    );
    return toWebhookAlertResponseDto(alert);
  }
}
