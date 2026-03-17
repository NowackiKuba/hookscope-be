import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuthModule } from '@auth/auth.module';
import { BillingModule } from '@billing/billing.module';
import { EndpointModule } from '@endpoint/endpoint.module';
import { RequestModule } from '@request/request.module';
import { UsageController } from './adapters/inbound/http/controllers/usage.controller';
import { GetUsageStatsHandler } from './application/queries/get-usage-stats/get-usage-stats.handler';

@Module({
  imports: [CqrsModule, AuthModule, BillingModule, EndpointModule, RequestModule],
  controllers: [UsageController],
  providers: [GetUsageStatsHandler],
})
export class UsageModule {}

