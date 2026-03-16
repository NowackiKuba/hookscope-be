import { createZodDto } from '@anatine/zod-nestjs';
import { createWaitlistEntrySchema } from './create-waitlist-entry.schema';

export class CreateWaitlistEntryDto extends createZodDto(
  createWaitlistEntrySchema,
) {}
