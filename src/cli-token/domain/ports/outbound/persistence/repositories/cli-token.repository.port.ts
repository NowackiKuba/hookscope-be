import { CLIToken } from '@cli-token/domain/aggregates/cli-token';
import { CLITokenId } from '@cli-token/domain/value-objects/cli-token-id.vo';
import { CLITokenHash } from '@cli-token/domain/value-objects/cli-token-hash.vo';

export interface CLITokenRepositoryPort {
  save(token: CLIToken): Promise<CLIToken>;
  findById(id: CLITokenId): Promise<CLIToken | null>;
  findByTokenHash(hash: CLITokenHash): Promise<CLIToken | null>;
  findByUserId(userId: string): Promise<CLIToken | null>;
  delete(id: CLITokenId): Promise<void>;
}
