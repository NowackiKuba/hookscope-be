import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UseFilters,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import { CreateWaitlistEntryCommand } from '@waitlist/application/commands/create-waitlist-entry/create-waitlist-entry.command';
import { DomainExceptionFilter } from '../filters/domain-exception.filter';
import {
  CreateWaitlistEntryDto,
  createWaitlistEntrySchema,
} from '../dto/create-waitlist-entry';
import { Public } from '@auth/infrastructure/decorators/public.decorator';

@Controller('waitlist')
@UseFilters(DomainExceptionFilter)
export class WaitlistController {
  constructor(private readonly commandBus: CommandBus) {}

  @Public()
  @Post()
  async create(@Body() body: CreateWaitlistEntryDto): Promise<{ id: string }> {
    const parsed = createWaitlistEntrySchema.safeParse(body);
    if (!parsed.success) {
      throw new BadRequestException(parsed.error.flatten());
    }
    const { email, source } = parsed.data;
    const id = await this.commandBus.execute(
      new CreateWaitlistEntryCommand({ email, source }),
    );
    return { id };
  }
}
