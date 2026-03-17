export class CLITokenHash {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): CLITokenHash {
    if (!value || value.trim().length === 0) {
      throw new Error('CLITokenHash cannot be empty');
    }
    return new CLITokenHash(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: CLITokenHash): boolean {
    return this._value === other._value;
  }
}
