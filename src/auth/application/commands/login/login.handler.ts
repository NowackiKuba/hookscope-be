import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { LoginCommand } from './login.command';
import { UserRepositoryPort } from '@users/domain/ports/repositories/user.repository.port';
import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { Inject, Optional, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Token as AuthToken } from '@auth/constants';
import { Token as UsersToken } from '@users/constants';
import { Email } from '@users/domain/value-objects/user-email.vo';
import { JwtService } from '@nestjs/jwt';
import { MAILER_TOKEN } from '@mailer/constants';
import type { EmailOutboxRepositoryPort } from '@mailer/domain/ports/email-outbox.repository.port';
import type { Config } from '@config/config.schema';

export type LoginResult = {
  accessToken: string;
  userId: string;
  email: string;
  onboardingCompleted: boolean;
};

@CommandHandler(LoginCommand)
export class LoginHandler implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(UsersToken.UserRepository)
    private readonly userRepository: UserRepositoryPort,
    @Inject(AuthToken.HashProvider)
    private readonly hashService: HashServicePort,
    private readonly jwtService: JwtService,
    @Optional()
    @Inject(MAILER_TOKEN.EmailOutboxRepository)
    private readonly emailOutbox: EmailOutboxRepositoryPort | null,
    private readonly config: ConfigService<Config, true>,
  ) {}

  async execute(command: LoginCommand): Promise<LoginResult> {
    const email = Email.create(command.payload.email);
    const user = await this.userRepository.getByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.hashService.compare(
      command.payload.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const payload = {
      sub: user.id.value,
      email: user.email.value,
      role: user.role as string,
    };
    const accessToken = this.jwtService.sign(payload);

    if (!user.isActive) {
      user.setActive();
      await this.userRepository.update(user);
    }

    const onboardingCompleted = true; // Can be extended with user profile completion flag

    return {
      accessToken,
      userId: user.id.value,
      email: user.email.value,
      onboardingCompleted,
    };
  }
}
