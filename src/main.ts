import { NestFactory } from '@nestjs/core';
import { ConfigService as NestConfigService } from '@nestjs/config';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { LoggerProvider } from './shared/constants';
import { Logger } from 'winston';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
// import { cleanupOpenApiDoc } from 'nestjs-zod';
import { AppModule } from './app.module';
import { MikroORM } from '@mikro-orm/core';
import { Config } from './config/config.schema';
import { validateEncryptionKey } from './common/utils/encryption.util';

const GLOBAL_PREFIX = 'api';
export const APP_NAME = 'revoply';

async function bootstrap() {
  validateEncryptionKey();

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  const orm = app.get(MikroORM);
  const migrator = orm.getMigrator();
  await migrator.up();

  const configService =
    app.get<NestConfigService<Config, true>>(NestConfigService);

  const logger = app.get<Logger>(LoggerProvider);
  const origin = configService.get('ORIGIN', { infer: true });
  const port = configService.get('PORT', { infer: true });

  app.setGlobalPrefix(GLOBAL_PREFIX);
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.enableCors({
    origin: [
      origin,
      'http://127.0.0.1:5500',
      'https://fe-dev-production-85d0.up.railway.app',
    ],
    credentials: true,
  });

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Prompt Generator API')
    .setDescription('API for the Prompt Generator application.')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // SwaggerModule.setup(GLOBAL_PREFIX, app, cleanupOpenApiDoc(document));

  await app.listen(port);

  logger.info(
    `🚀 Application is running on: http://localhost:${port}/${GLOBAL_PREFIX}`,
  );
}

bootstrap().catch((error) => {
  process.stderr.write(
    `Failed to start application: ${error instanceof Error ? error.message : String(error)}\n`,
  );
  process.exit(1);
});
