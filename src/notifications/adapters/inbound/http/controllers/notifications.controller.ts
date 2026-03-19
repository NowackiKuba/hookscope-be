import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '@auth/adapters/inbound/http/decorators/current-user.decorator';
import { AuthGuard } from '@auth/adapters/inbound/http/guards/auth.guard';
import type { AuthenticatedUser } from '@auth/domain/ports/outbound';
import { NotificationService } from '@notifications/application/services/notification.service';
import { CREATE_NOTIFICATION_SCHEMA } from '../dto/create-notification/create-notification.schema';
import { GET_NOTIFICATIONS_SCHEMA } from '../dto/get-notifications/get-notifications.schema';
import {
  PaginatedNotificationsResponseDto,
  NotificationResponseDto,
  toNotificationResponseDto,
  toPaginatedNotificationsResponseDto,
} from '../dto/notification-response.dto';

@Controller('notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  async create(
    @Body() body: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    const parsed = CREATE_NOTIFICATION_SCHEMA.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const notification = await this.notificationService.create({
      referenceId: parsed.data.referenceId,
      payload: parsed.data.payload,
      userId: parsed.data.userId ?? user.userId,
      channel: parsed.data.channel,
      status: parsed.data.status,
      failedReason: parsed.data.failedReason,
      sentAt: parsed.data.sentAt,
    });

    return toNotificationResponseDto(notification);
  }

  @Get()
  async list(
    @Query() query: Record<string, unknown>,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<PaginatedNotificationsResponseDto> {
    const parsed = GET_NOTIFICATIONS_SCHEMA.safeParse(query);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }

    const page = await this.notificationService.getByUserId(user.userId, {
      channel: parsed.data.channel,
      status: parsed.data.status,
      limit: parsed.data.limit,
      offset: parsed.data.offset,
      orderBy: parsed.data.orderBy,
      orderByField: parsed.data.orderByField,
    });

    return toPaginatedNotificationsResponseDto(page);
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: AuthenticatedUser,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationService.getById(id);

    if (!notification || notification.userId !== user.userId) {
      throw new NotFoundException(`Notification ${id} not found`);
    }

    return toNotificationResponseDto(notification);
  }
}
