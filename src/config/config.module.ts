import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { validateConfig } from './config.schema';

export const configuration = NestConfigModule.forRoot({
  isGlobal: true,
  validate: validateConfig,
});

@Global()
@Module({
  imports: [configuration],
})
export class ConfigModule {}
