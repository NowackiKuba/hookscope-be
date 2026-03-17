export class CLITokenId {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): CLITokenId {
    if (!value || value.trim().length === 0) {
      throw new Error('CLITokenId cannot be empty');
    }
    return new CLITokenId(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: CLITokenId): boolean {
    return this._value === other._value;
  }
}
