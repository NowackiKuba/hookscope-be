import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '@auth/infrastructure/decorators/public.decorator';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { GetEndpointByTokenQuery } from '@endpoint/application/queries/get-endpoint-by-token/get-endpoint-by-token.query';
import { ReceiveRequestCommand } from '@request/application/commands/receive-request/receive-request.command';
import type { Request as ExpressRequest } from 'express';
import { Token as BillingToken } from '@billing/constants';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import type { PacketRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/packet.repository.port';
import {
  packetToLimits,
  subscriptionPeriod,
} from '@billing/application/utils/packet-limits';
import { Token as RequestToken } from '@request/constants';
import type { RequestRepositoryPort } from '@request/domain/ports/outbound/persistence/repositories/request.repository.port';
import { Inject } from '@nestjs/common';

function headersToRecord(
  headers: ExpressRequest['headers'],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    if (v !== undefined && v !== null) {
      out[k] = Array.isArray(v) ? v.join(', ') : String(v);
    }
  }
  return out;
}

function queryToRecord(query: ExpressRequest['query']): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) {
      out[k] = Array.isArray(v) ? (v as string[]).join(',') : String(v);
    }
  }
  return out;
}

@Controller('hooks')
@UseGuards(JwtAuthGuard)
export class HooksController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    @Inject(BillingToken.SubscriptionRepository)
    private readonly subscriptions: SubscriptionRepositoryPort,
    @Inject(BillingToken.PacketRepository)
    private readonly packets: PacketRepositoryPort,
    @Inject(RequestToken.RequestRepository)
    private readonly requests: RequestRepositoryPort,
  ) {}

  @Public()
  @Post(':token')
  async receive(
    @Param('token') token: string,
    @Req() req: ExpressRequest & { rawBody?: Buffer },
  ): Promise<{ received: true }> {
    try {
      const endpoint = await this.queryBus.execute(
        new GetEndpointByTokenQuery({ token }),
      );
      if (!endpoint) {
        return { received: true };
      }

      const userId = endpoint.userId;
      const subscription = await this.subscriptions.findByUserId(userId);
      const packet = subscription
        ? await this.packets.findById(subscription.toJSON().packetId)
        : await this.packets.findByCode('free');

      let overlimit = false;
      if (packet) {
        const limits = packetToLimits(packet);
        if (limits.requestsPerMonth != null) {
          const { start, end } = subscriptionPeriod({ packet, subscription });
          const used = await this.requests.countByUserIdInPeriod(
            userId,
            start,
            end,
          );
          overlimit = used >= limits.requestsPerMonth;
        }
      }

      const contentType =
        typeof req.headers['content-type'] === 'string'
          ? req.headers['content-type']
          : null;
      const size =
        typeof req.headers['content-length'] === 'string'
          ? parseInt(req.headers['content-length'], 10) || 0
          : 0;

      let body: Record<string, unknown> | null = null;
      if (
        req.body &&
        typeof req.body === 'object' &&
        !Buffer.isBuffer(req.body)
      ) {
        body = req.body as Record<string, unknown>;
      }

      // Capture raw body bytes for webhook signature verification
      const rawBody = req.rawBody ? req.rawBody.toString('base64') : null;

      await this.commandBus.execute(
        new ReceiveRequestCommand({
          endpointId: endpoint.id,
          method: req.method,
          headers: headersToRecord(req.headers),
          body,
          query: queryToRecord(req.query),
          ip: req.ip ?? req.socket?.remoteAddress ?? null,
          contentType,
          size: Number.isNaN(size) ? 0 : size,
          overlimit,
          rawBody,
        }),
      );
    } catch {
      // Never return an error to the webhook sender
    }
    return { received: true };
  }
}
