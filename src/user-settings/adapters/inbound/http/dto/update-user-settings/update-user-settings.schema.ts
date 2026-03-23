import z from 'zod';
import { GenerationTarget } from '@endpoint/domain/value-objects/endpoint-schema-generated.vo';

const notificationChannelsSchema = z
  .object({
    email: z.boolean().optional(),
    slack: z.boolean().optional(),
    discord: z.boolean().optional(),
  })
  .refine(
    (v) =>
      v.email !== undefined ||
      v.slack !== undefined ||
      v.discord !== undefined,
    { message: 'notificationChannels must include at least one flag' },
  );

export const updateUserSettingsSchema = z
  .strictObject({
    autoGenerationTargets: z.array(z.nativeEnum(GenerationTarget)).optional(),
    manualGenerationTargets: z
      .array(z.nativeEnum(GenerationTarget))
      .optional(),
    notificationChannels: notificationChannelsSchema.optional(),
    slackWebhookUrl: z.union([z.string().url(), z.null()]).optional(),
    discordWebhookUrl: z.union([z.string().url(), z.null()]).optional(),
    alertEmailAddress: z.union([z.string().email(), z.null()]).optional(),
    defaultSilenceThreshold: z.coerce.number().int().min(1).optional(),
    volumeSpikeMultiplier: z.coerce.number().positive().optional(),
    language: z.string().min(2).max(32).optional(),
    theme: z.enum(['light', 'dark', 'system']).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided',
  });

export type UpdateUserSettingsInput = z.infer<typeof updateUserSettingsSchema>;
