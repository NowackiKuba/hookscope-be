import { createHash } from 'crypto';

export function hashPayload(payload: Record<string, unknown>): string {
  return createHash('sha256')
    .update(JSON.stringify(sortKeys(payload)))
    .digest('hex');
}

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as object)
      .sort()
      .reduce(
        (acc, key) => {
          acc[key] = sortKeys((obj as Record<string, unknown>)[key]);
          return acc;
        },
        {} as Record<string, unknown>,
      );
  }
  return obj;
}
