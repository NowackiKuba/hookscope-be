export type EndpointDirectoryColorValue =
  | 'slate'
  | 'gray'
  | 'zinc'
  | 'neutral'
  | 'stone'
  | 'red'
  | 'orange'
  | 'amber'
  | 'yellow'
  | 'lime'
  | 'green'
  | 'emerald'
  | 'teal'
  | 'cyan'
  | 'sky'
  | 'blue'
  | 'indigo'
  | 'violet'
  | 'purple'
  | 'fuchsia'
  | 'pink'
  | 'rose';

export const VALID_ENDPOINT_DIRECTORIES_COLORS: EndpointDirectoryColorValue[] =
  [
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
  ];

export class EndpointDirectoryColor {
  private readonly _value: EndpointDirectoryColorValue;
  private constructor(private readonly v: EndpointDirectoryColorValue) {
    this._value = v;
  }

  static create(v: string) {
    if (!v || v.trim().length === 0) {
      throw new Error('endpoint directory color cannot be empty');
    }

    const validValue = VALID_ENDPOINT_DIRECTORIES_COLORS.find(
      (valid) => valid === v,
    );

    if (!validValue) {
      throw new Error('invalid endpoint directory value');
    }

    return new EndpointDirectoryColor(validValue);
  }

  get value(): EndpointDirectoryColorValue {
    return this._value;
  }
}
