export class CLITokenPrefix {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  static create(value: string): CLITokenPrefix {
    if (!value || value.trim().length === 0) {
      throw new Error('CLITokenPrefix cannot be empty');
    }
    return new CLITokenPrefix(value.trim());
  }

  get value(): string {
    return this._value;
  }

  equals(other: CLITokenPrefix): boolean {
    return this._value === other._value;
  }
}
