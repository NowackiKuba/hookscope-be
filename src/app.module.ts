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

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MailerModule,
    WinstonModule.forRoot(baseLoggerConfig('hookscope-be')),
    MikroOrmModule.forRoot(ormConfig),
    AuthModule,
    EndpointModule,
    RequestModule,
    RetryModule,
    SocketsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
