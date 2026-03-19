export interface SchemaDiff {
  added: string[];
  removed: string[];
  typeChanged: { field: string; from: string; to: string }[];
}

export function flattenSchema(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, string> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (Array.isArray(value)) {
        acc[fullKey] = 'array';
        if (
          value.length > 0 &&
          typeof value[0] === 'object' &&
          value[0] !== null
        ) {
          Object.assign(
            acc,
            flattenSchema(value[0] as Record<string, unknown>, `${fullKey}[]`),
          );
        }
      } else if (value !== null && typeof value === 'object') {
        Object.assign(
          acc,
          flattenSchema(value as Record<string, unknown>, fullKey),
        );
      } else {
        acc[fullKey] = value === null ? 'null' : typeof value;
      }

      return acc;
    },
    {} as Record<string, string>,
  );
}

export function diffSchemas(
  previous: Record<string, string>,
  current: Record<string, string>,
): SchemaDiff | null {
  const added = Object.keys(current).filter((k) => !(k in previous));
  const removed = Object.keys(previous).filter((k) => !(k in current));
  const typeChanged = Object.keys(current)
    .filter((k) => k in previous && previous[k] !== current[k])
    .map((k) => ({ field: k, from: previous[k], to: current[k] }));

  if (added.length === 0 && removed.length === 0 && typeChanged.length === 0) {
    return null; // brak diffu
  }

  return { added, removed, typeChanged };
}

export function isSchemaDiffEmpty(diff: SchemaDiff): boolean {
  return (
    diff.added.length === 0 &&
    diff.removed.length === 0 &&
    diff.typeChanged.length === 0
  );
}
