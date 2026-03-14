import { Controller, Param, Post, Req, UseGuards } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { Public } from '@auth/infrastructure/decorators/public.decorator';
import { JwtAuthGuard } from '@auth/infrastructure/guards/jwt-auth.guard';
import { GetEndpointByTokenQuery } from '@endpoint/application/queries/get-endpoint-by-token/get-endpoint-by-token.query';
import { ReceiveRequestCommand } from '@request/application/commands/receive-request/receive-request.command';
import type { Request as ExpressRequest } from 'express';

function headersToRecord(headers: ExpressRequest['headers']): Record<string, string> {
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
  ) {}

  @Public()
  @Post(':token')
  async receive(
    @Param('token') token: string,
    @Req() req: ExpressRequest,
  ): Promise<{ received: true }> {
    try {
      const endpoint = await this.queryBus.execute(
        new GetEndpointByTokenQuery({ token }),
      );
      if (!endpoint) {
        return { received: true };
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
      if (req.body && typeof req.body === 'object' && !Buffer.isBuffer(req.body)) {
        body = req.body as Record<string, unknown>;
      }

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
          overlimit: false,
        }),
      );
    } catch {
      // Never return an error to the webhook sender
    }
    return { received: true };
  }
}
