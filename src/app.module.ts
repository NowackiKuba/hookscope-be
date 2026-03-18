import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { MikroOrmModule } from '@mikro-orm/nestjs';
import { WinstonModule } from 'nest-winston';
import { config as ormConfig } from './orm/database.config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { baseLoggerConfig } from './shared/utils/logger';
import { MailerModule } from './mailer/mailer.module';
import { EndpointModule } from './endpoint/endpoint.module';
import { RequestModule } from './request/request.module';
import { RetryModule } from './retry/retry.module';
import { SocketsModule } from './sockets/sockets.module';
import { WaitlistModule } from './waitlist/waitlist.module';
import { BillingModule } from './billing/billing.module';
import { UsageModule } from './usage/usage.module';
import { CliTokenModule } from './cli-token/cli-token.module';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MailerModule,
    WinstonModule.forRoot(baseLoggerConfig('hookscope-be')),
    MikroOrmModule.forRoot(ormConfig),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: NestConfigService) => {
        const host = configService.get<string>('REDIS_HOST') || 'localhost';
        const port = configService.get<number>('REDIS_PORT') || 6379;
        const password = configService.get<string>('REDIS_PASSWORD');

        const connection: {
          host: string;
          port: number;
          password?: string;
        } = {
          host,
          port: Number(port),
        };

        if (password) {
          connection.password = password;
        }

        return {
          connection,
        };
      },
      inject: [NestConfigService],
    }),
    AuthModule,
    EndpointModule,
    RequestModule,
    RetryModule,
    SocketsModule,
    WaitlistModule,
    BillingModule,
    UsageModule,
    CliTokenModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
