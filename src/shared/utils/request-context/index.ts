import { EntityManager, MikroORM, RequestContext } from '@mikro-orm/core';

/**
 * Returns the EntityManager from the current RequestContext (fork or request) if set,
 * otherwise the given fallback. Use this in repositories so they work in both
 * HTTP requests (request-scoped EM) and background jobs/crons (forked EM via withForkedContext).
 */
export function getContextEntityManager(fallback: EntityManager): EntityManager {
  const ctx = RequestContext.getEntityManager();
  return (ctx ?? fallback) as EntityManager;
}

/**
 * Executes a callback within a forked RequestContext.
 * This ensures each operation has its own isolated database context,
 * preventing issues with concurrent processing (especially useful in queue workers).
 * The callback receives the forked EntityManager so all DB operations use the same context.
 *
 * @param orm - The MikroORM instance
 * @param callback - The async callback function to execute within the forked context (receives the forked em)
 * @returns The result of the callback
 *
 * @example
 * ```typescript
 * await withForkedContext(this.orm, async (em) => {
 *   await this.someService.run(em);
 * });
 * ```
 */
export async function withForkedContext<T>(
  orm: MikroORM,
  callback: (em: EntityManager) => Promise<T>,
): Promise<T> {
  const forked = orm.em.fork();
  return await RequestContext.create(forked, () => callback(forked));
}
