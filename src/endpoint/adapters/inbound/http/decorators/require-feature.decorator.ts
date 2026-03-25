import { SetMetadata } from '@nestjs/common';
import type { PacketLimits } from '@billing/application/utils/packet-limits';

export const FEATURE_KEY = 'requiredFeature';

/**
 * Mark a route as requiring a specific boolean feature from PacketLimits.
 * Use together with FeatureAccessGuard.
 *
 * @example
 * @RequireFeature('dtoGeneration')
 */
export const RequireFeature = (feature: BooleanFeatureKey) =>
  SetMetadata(FEATURE_KEY, feature);

export type BooleanFeatureKey = {
  [K in keyof PacketLimits]: PacketLimits[K] extends boolean ? K : never;
}[keyof PacketLimits];
