import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WinstonModule } from 'nest-winston';
import { config as ormConfig } from './orm/database.config';
// import { baseLoggerConfig } from './shared/utils/logger';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { baseLoggerConfig } from './shared/utils/logger';
// import { CompanyProfilesModule } from './company-profiles/company-profiles.module';
// import { ReviewsModule } from './reviews/reviews.module';
// import { SystemPromptsModule } from './system-prompts/system-prompts.module';
// import { ResponsesModule } from './responses/responses.module';
// import { StatsModule } from './stats/stats.module';
// import { BillingModule } from './billing/billing.module';
// import { GeoModule } from './geo/geo.module';
// import { CreditsModule } from './credits/credits.module';
import { MailerModule } from './mailer/mailer.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MailerModule,
    // CreditsModule,
    WinstonModule.forRoot(baseLoggerConfig('borowa-be')),
    MikroOrmModule.forRoot(ormConfig),
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
