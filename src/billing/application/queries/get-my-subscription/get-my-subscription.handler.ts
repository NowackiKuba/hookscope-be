import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { Token } from '@billing/constants';
import type { SubscriptionRepositoryPort } from '@billing/domain/ports/outbound/persistence/repositories/subscription.repository.port';
import { Subscription } from '@billing/domain/aggregates/subscription';
import { GetMySubscriptionQuery } from './get-my-subscription.query';

@QueryHandler(GetMySubscriptionQuery)
export class GetMySubscriptionHandler
  implements IQueryHandler<GetMySubscriptionQuery>
{
  constructor(
    @Inject(Token.SubscriptionRepository)
    private readonly subscriptions: SubscriptionRepositoryPort,
  ) {}

  async execute(query: GetMySubscriptionQuery): Promise<Subscription | null> {
    return await this.subscriptions.findByUserId(query.userId);
  }
}

