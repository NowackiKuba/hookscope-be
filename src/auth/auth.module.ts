import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Token, JWT_CONFIG } from './constants';
import { BcryptAdapter } from './adapters/outbound/persistence/adapters/bcrypt.adapter';
import { JwtAuthenticationAdapter } from './adapters/outbound/services/jwt-authentication.adapter';
import { LoginHandler } from './application/commands/login/login.handler';
import { RegisterUserHandler } from './application/commands/register-user/register-user.handler';
import { GetUserHandler } from '@users/application/queries/get-user/get-user.handler';
import { JwtStrategy } from './infrastructure/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/guards/jwt-auth.guard';
import { RolesGuard } from './infrastructure/guards/roles.guard';
import { UsersModule } from '@users/users.module';
import { AuthInboundController } from './adapters/inbound/http/controllers/auth.controller';
import { AdminGuard } from './adapters/inbound/http/guards/admin.guard';
import { AuthGuard } from './adapters/inbound/http/guards/auth.guard';
import { OptionalAuthGuard } from './adapters/inbound/http/guards/optional-auth.guard';
import { ApiKeyGuard } from './adapters/inbound/http/guards/api-key-guard';
import { ApiKeyOrAuthWithAdminGuard } from './adapters/inbound/http/guards/api-key-or-auth-with-admin.guard';
import { DomainExceptionFilter } from './adapters/inbound/http/filters/domain-exception.filter';
import { CreateUserHandler } from '@users/application/commands/create-user/create-user.handler';
import { ResetPasswordHandler } from './application/commands/reset-password/reset-password.handler';
import { UpdatePasswordHandler } from './application/commands/update-password/update-password.handler';
import { ForgotPasswordHandler } from './application/commands/forgot-password/forgot-password.handler';

const CommandHandlers = [
  LoginHandler,
  RegisterUserHandler,
  ForgotPasswordHandler,
  CreateUserHandler,
  ResetPasswordHandler,
  UpdatePasswordHandler,
];
const QueryHandlers = [GetUserHandler];

@Module({
  imports: [
    ConfigModule,
    UsersModule,

    CqrsModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const expiresIn =
          config.get<string>(JWT_CONFIG.EXPIRES_IN_ENV) ??
          JWT_CONFIG.DEFAULT_EXPIRES_IN;
        return {
          secret: config.get<string>(JWT_CONFIG.SECRET_KEY_ENV),
          signOptions: { expiresIn },
        } as JwtModuleOptions;
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthInboundController],
  providers: [
    ...CommandHandlers,
    ...QueryHandlers,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthGuard,
    AdminGuard,
    OptionalAuthGuard,
    ApiKeyGuard,
    ApiKeyOrAuthWithAdminGuard,
    DomainExceptionFilter,
    {
      provide: Token.HashProvider,
      useClass: BcryptAdapter,
    },
    {
      provide: Token.AuthenticationService,
      useClass: JwtAuthenticationAdapter,
    },
  ],
  exports: [
    JwtModule,
    PassportModule,
    CqrsModule,
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
    AuthGuard,
    AdminGuard,
    OptionalAuthGuard,
    ApiKeyGuard,
    ApiKeyOrAuthWithAdminGuard,
    Token.AuthenticationService,
    Token.HashProvider,
  ],
})
export class AuthModule {}
