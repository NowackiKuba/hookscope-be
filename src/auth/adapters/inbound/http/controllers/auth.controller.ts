import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { LoginCommand } from '@auth/application/commands/login/login.command';
import { RegisterUserCommand } from '@auth/application/commands/register-user/register-user.command';
import { ForgotPasswordCommand } from '@auth/application/commands/forgot-password/forgot-password.command';
import { ResetPasswordCommand } from '@auth/application/commands/reset-password/reset-password.command';
import { AuthGuard } from '../guards/auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { Public } from '@auth/infrastructure/decorators/public.decorator';
import { GetUserQuery } from '@users/application/queries/get-user/get-user.query';
import { ForgotPasswordDto } from '../dto/forgot-password';
import { ResetPasswordDto } from '../dto/reset-password';
import { UpdatePasswordDto } from '../dto/update-password';
import { UpdatePasswordCommand } from '@auth/application/commands/update-password/update-password.command';
import { UpdateUserDto } from '../dto/update-user';
import { UpdateUserCommand } from '@users/application/commands/update-user/update-user.command';

@Controller('auth')
@UseFilters(DomainExceptionFilter)
export class AuthInboundController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBys: QueryBus,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() body: { email: string; password: string }): Promise<{
    accessToken: string;
    userId: string;
    email: string;
    onboardingCompleted: boolean;
  }> {
    return this.commandBus.execute(
      new LoginCommand({ email: body.email, password: body.password }),
    );
  }

  @Public()
  @Post('register')
  async register(
    @Body()
    body: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
    },
  ): Promise<{ userId: string }> {
    const userId = await this.commandBus.execute(
      new RegisterUserCommand({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        password: body.password,
      }),
    );
    return { userId };
  }

  @Public()
  @Post('forgot-password')
  async forgotPassword(
    @Body() body: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new ForgotPasswordCommand({ email: body.email }),
    );
    return {
      message:
        'If an account exists with this email, you will receive a reset link shortly.',
    };
  }

  @Public()
  @Post('reset-password')
  async resetPassword(
    @Body() body: ResetPasswordDto,
  ): Promise<{ message: string }> {
    await this.commandBus.execute(
      new ResetPasswordCommand({
        token: body.token,
        newPassword: body.newPassword,
      }),
    );
    return { message: 'Your password has been reset. You can now log in.' };
  }

  @UseGuards(AuthGuard)
  @Patch('me')
  async updateMe(
    @Body() body: UpdateUserDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ userId: string }> {
    const userId = (await this.commandBus.execute(
      new UpdateUserCommand({
        ...body,
        id: user.userId,
      }),
    )) as string;
    return { userId };
  }

  @UseGuards(AuthGuard)
  @Patch('me/password')
  async updatePassword(
    @Body() body: UpdatePasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return await this.commandBus.execute(
      new UpdatePasswordCommand({
        ...body,
        id: user.userId,
      }),
    );
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getProfile(@CurrentUser() user: AuthenticatedUser) {
    return await this.queryBys.execute(
      new GetUserQuery({
        userId: user.userId,
      }),
    );
  }
}
