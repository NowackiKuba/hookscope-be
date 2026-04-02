import {
  BadRequestException,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Body,
  Query,
  UseFilters,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { CommandBus, EventBus, QueryBus } from '@nestjs/cqrs';
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
import { Token } from '@endpoint/constants';
import type { EndpointRepositoryPort } from '@endpoint/domain/ports/outbound/persistence/repositories/endpoint.repository.port';
import { AlertDetectedEvent } from '@webhook/domain/events/alert-detected.event';
import { AlertMetadata } from '@webhook/domain/value-objects/alert-metadata.vo';
import { UpdateWebhookAlertDto } from '../dto/update-webhook-alert';
import { UpdateWebhookAlertCommand } from '@webhook/application/commands/update-webhook-alert/update-webhok-alert.command';

@Controller('webhook-alerts')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class WebhookAlertsController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly eventBus: EventBus,
    private readonly commandBus: CommandBus,
    @Inject(Token.EndpointRepository)
    private readonly endpointRepository: EndpointRepositoryPort,
  ) {}

  // @Post('test/schema-drift')
  // async emitSchemaDriftTestAlert(
  //   @Body() body: { endpointId?: string; eventType?: string },
  //   @CurrentUser() user: AuthenticatedUser,
  // ): Promise<{ queued: boolean; endpointId: string; eventType: string }> {
  //   let endpointId = body?.endpointId;

  //   if (!endpointId) {
  //     const endpoints = await this.endpointRepository.findAllByUserId(
  //       user.userId,
  //     );
  //     if (endpoints.length === 0) {
  //       throw new BadRequestException(
  //         'No endpoints found for current user. Create endpoint first or pass endpointId.',
  //       );
  //     }
  //     endpointId = endpoints[0].id;
  //   } else {
  //     const endpoint = await this.endpointRepository.findById(endpointId);
  //     if (!endpoint || endpoint.userId !== user.userId) {
  //       throw new BadRequestException(
  //         `Endpoint ${endpointId} not found or not owned by current user.`,
  //       );
  //     }
  //   }

  //   const eventType = body?.eventType ?? 'checkout.session.completed';

  //   await this.eventBus.publish(
  //     new AlertDetectedEvent({
  //       type: 'schema_drift',
  //       endpointId,
  //       userId: user.userId,
  //       eventType,
  //       metadata: AlertMetadata.schemaDrift({
  //         added: ['customer.address.postal_code'],
  //         removed: [],
  //         typeChanged: [
  //           { field: 'amount_total', from: 'number', to: 'string' },
  //         ],
  //         updatedDto: null,
  //       }).value,
  //     }),
  //   );

  //   return { queued: true, endpointId, eventType };
  // }

  @Get()
  async list(
    @Query() query: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedWebhookAlertsResponseDto> {
    const parsed = GET_WEBHOOK_ALERTS_SCHEMA.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const { limit, offset, orderBy, orderByField, type, status, endpointId } =
      parsed.data;

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

  @Get('endpoints/:id')
  async getByEndpointId(
    @Param('id') id: string,
    @Query() query: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedWebhookAlertsResponseDto> {
    const parsed = GET_WEBHOOK_ALERTS_SCHEMA.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const page = await this.queryBus.execute(
      new GetWebhookAlertsQuery({
        userId: user.userId,
        endpointId: id,
        limit: parsed.data.limit,
        offset: parsed.data.offset,
        orderBy: parsed.data.orderBy,
        orderByField: parsed.data.orderByField,
        type: parsed.data.type,
        status: parsed.data.status,
      }),
    );

    //

    return toPaginatedWebhookAlertsResponseDto(page);
  }

  @Patch('/:id')
  async update(
    @Body() body: UpdateWebhookAlertDto,
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    const result = await this.commandBus.execute(
      new UpdateWebhookAlertCommand({
        id,
        userId: user.userId,
        scannerStatus: body.scannerStatus,
        status: body.status,
      }),
    );

    return result;
  }
}
