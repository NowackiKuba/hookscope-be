import {
  Controller,
  Get,
  Post,
  UseFilters,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import type { CLITokenResponseDto } from '../dto/cli-token-response.dto';
import { CreateCLITokenCommand } from '@cli-token/application/commands/create-cli-token/create-cli-token.command';
import { RotateCLITokenCommand } from '@cli-token/application/commands/rotate-cli-token/rotate-cli-token.command';
import { GetUserCLITokenQuery } from '@cli-token/application/queries/get-user-cli-token/get-user-cli-token.query';
import type { CLIToken } from '@cli-token/domain/aggregates/cli-token';
import { generateUUID } from '@shared/utils/generate-uuid';

function toResponseDto(token: CLIToken): CLITokenResponseDto {
  const json = token.toJSON();
  return {
    id: json.id,
    prefix: json.prefix,
    lastUsedAt: json.lastUsedAt?.toISOString() ?? null,
  };
}

@Controller('cli-tokens')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class CLITokenController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  async get(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<CLITokenResponseDto | null> {
    const token = (await this.queryBus.execute(
      new GetUserCLITokenQuery({ userId: user.userId }),
    )) as CLIToken | null;
    return token ? toResponseDto(token) : null;
  }

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ token: string }> {
    const rawToken = (await this.commandBus.execute(
      new CreateCLITokenCommand({
        id: generateUUID(),
        userId: user.userId,
      }),
    )) as string;
    return { token: rawToken };
  }

  @Post('rotate')
  @HttpCode(HttpStatus.OK)
  async rotate(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<{ token: string }> {
    const token = (await this.queryBus.execute(
      new GetUserCLITokenQuery({ userId: user.userId }),
    )) as CLIToken | null;
    if (!token) {
      const { CLITokenNotFoundException } =
        await import('@cli-token/domain/exceptions/cli-token-not-found.exception');
      throw new CLITokenNotFoundException();
    }
    const rawToken = (await this.commandBus.execute(
      new RotateCLITokenCommand({ id: token.id.value, userId: user.userId }),
    )) as string;
    return { token: rawToken };
  }
}
