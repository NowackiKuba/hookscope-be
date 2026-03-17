import { generateUUID } from '@shared/utils/generate-uuid';
import { CLITokenId } from '../value-objects/cli-token-id.vo';
import { CLITokenHash } from '../value-objects/cli-token-hash.vo';
import { CLITokenPrefix } from '../value-objects/cli-token-prefix.vo';

export type CLITokenProps = {
  id?: string;
  userId: string;
  tokenHash: string;
  prefix: string;
  lastUsedAt?: Date | null;
};

export type CLITokenJSON = {
  id: string;
  userId: string;
  tokenHash: string;
  prefix: string;
  lastUsedAt: Date | null;
};

export class CLIToken {
  private _id: CLITokenId;
  private _userId: string;
  private _tokenHash: CLITokenHash;
  private _prefix: CLITokenPrefix;
  private _lastUsedAt: Date | null;

  private constructor(props: CLITokenProps) {
    this._id = CLITokenId.create(props.id ?? generateUUID());
    this._userId = props.userId;
    this._tokenHash = CLITokenHash.create(props.tokenHash);
    this._prefix = CLITokenPrefix.create(props.prefix);
    this._lastUsedAt = props.lastUsedAt ?? null;
  }

  static create(props: CLITokenProps): CLIToken {
    return new CLIToken(props);
  }

  get id(): CLITokenId {
    return this._id;
  }

  get userId(): string {
    return this._userId;
  }

  get tokenHash(): CLITokenHash {
    return this._tokenHash;
  }

  get prefix(): CLITokenPrefix {
    return this._prefix;
  }

  get lastUsedAt(): Date | null {
    return this._lastUsedAt;
  }

  markUsed(): void {
    this._lastUsedAt = new Date();
  }

  toJSON(): CLITokenJSON {
    return {
      id: this._id.value,
      userId: this._userId,
      tokenHash: this._tokenHash.value,
      prefix: this._prefix.value,
      lastUsedAt: this._lastUsedAt,
    };
  }
}
