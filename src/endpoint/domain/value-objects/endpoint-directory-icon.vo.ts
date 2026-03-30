export type EndpointDirectoryIconValue =
  | 'Folder'
  | 'FolderOpen'
  | 'FolderTree'
  | 'LayoutGrid'
  | 'Layers'
  | 'Box'
  | 'Package'
  | 'Archive'
  | 'Webhook'
  | 'Link2'
  | 'Globe'
  | 'Server'
  | 'Database'
  | 'Zap'
  | 'Code'
  | 'Braces';

export const VALID_ENDPOINT_DIRECTORY_ICONS: EndpointDirectoryIconValue[] = [
  'Folder',
  'FolderOpen',
  'FolderTree',
  'LayoutGrid',
  'Layers',
  'Box',
  'Package',
  'Archive',
  'Webhook',
  'Link2',
  'Globe',
  'Server',
  'Database',
  'Zap',
  'Code',
  'Braces',
];

export class EndpointDirectoryIcon {
  private readonly _value: EndpointDirectoryIconValue;
  private constructor(private readonly v: EndpointDirectoryIconValue) {
    this._value = v;
  }

  static create(v: string) {
    if (!v || v.trim().length === 0) {
      throw new Error('endpoint directory icon cannot be empty');
    }

    const validValue = VALID_ENDPOINT_DIRECTORY_ICONS.find(
      (valid) => valid === v,
    );

    if (!validValue) {
      throw new Error('invalid endpoint directory icon');
    }

    return new EndpointDirectoryIcon(validValue);
  }

  get value(): EndpointDirectoryIconValue {
    return this._value;
  }
}
