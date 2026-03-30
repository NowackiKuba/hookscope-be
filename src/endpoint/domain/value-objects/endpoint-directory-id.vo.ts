export class EndpointDirectoryId {
  private constructor(private _value: string) {}

  static create(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('endpoint directory id cannot be empty');
    }

    return new EndpointDirectoryId(value);
  }

  get value() {
    return this._value;
  }
}
