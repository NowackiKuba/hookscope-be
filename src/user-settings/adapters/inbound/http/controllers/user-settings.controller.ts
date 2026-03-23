import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Patch,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import { GetUserSettingsByUserIdQuery } from '@user-settings/application/queries/get-user-settings-by-user-id/get-user-settings-by-user-id.query';
import { UpdateUserSettingsCommand } from '@user-settings/application/commands/update-user-settings/update-user-settings.command';
import type { UserSettingsResponseDto } from '../dto/user-settings-response.dto';
import {
  UpdateUserSettingsDto,
  updateUserSettingsSchema,
} from '../dto/update-user-settings';
import type { UserSettings } from '@user-settings/domain/aggregates/user-settings';

function toResponseDto(settings: UserSettings): UserSettingsResponseDto {
  const json = settings.toJSON();
  return {
    id: json.id,
    userId: json.userId,
    autoGenerationTargets: json.autoGenerationTargets,
    manualGenerationTargets: json.manualGenerationTargets,
    notificationChannels: json.notificationChannels,
    slackWebhookUrl: json.slackWebhookUrl,
    discordWebhookUrl: json.discordWebhookUrl,
    alertEmailAddress: json.alertEmailAddress,
    defaultSilenceThreshold: json.defaultSilenceThreshold,
    volumeSpikeMultiplier: json.volumeSpikeMultiplier,
    language: json.language,
    theme: json.theme,
    createdAt: json.createdAt.toISOString(),
    updatedAt: json.updatedAt.toISOString(),
  };
}

@Controller('user-settings')
@UseFilters(DomainExceptionFilter)
@UseGuards(AuthGuard)
export class UserSettingsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('me')
  async getMine(
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserSettingsResponseDto> {
    const settings = (await this.queryBus.execute(
      new GetUserSettingsByUserIdQuery({ userId: user.userId }),
    )) as UserSettings;
    return toResponseDto(settings);
  }

  @Patch('me')
  async patchMine(
    @Body() body: UpdateUserSettingsDto,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<UserSettingsResponseDto> {
    const parsed = updateUserSettingsSchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    await this.commandBus.execute(
      new UpdateUserSettingsCommand({
        userId: user.userId,
        patch: parsed.data,
      }),
    );
    const settings = (await this.queryBus.execute(
      new GetUserSettingsByUserIdQuery({ userId: user.userId }),
    )) as UserSettings;
    return toResponseDto(settings);
  }
}
