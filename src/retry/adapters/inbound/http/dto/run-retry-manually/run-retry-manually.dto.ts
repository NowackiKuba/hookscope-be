import { createZodDto } from '@anatine/zod-nestjs';
import { RUN_RETRY_MANUALLY_SCHEMA } from './run-retry-manually.schema';

export class RunRetryManuallyDto extends createZodDto(RUN_RETRY_MANUALLY_SCHEMA) {}
