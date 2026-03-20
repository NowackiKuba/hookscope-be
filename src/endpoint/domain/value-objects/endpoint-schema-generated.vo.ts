export enum GenerationTarget {
  NESTJS_DTO = 'nestjs_dto',
  ZOD_SCHEMA = 'zod_schema',
  TS_INTERFACE = 'ts_interface',
  GO_STRUCT = 'go_struct',
  PYTHON_DATACLASS = 'python_dataclass',
  JAVA_CLASS = 'java_class',
  RUST_STRUCT = 'rust_struct',
  PRISMA_MODEL = 'prisma_model',
}

export const VALID_ENDPOINT_SCHEMA_GENERATED_KEYS = Object.values(
  GenerationTarget,
) as readonly GenerationTarget[];

export type EndpointSchemaGeneratedKey = GenerationTarget;

export type EndpointSchemaGeneratedValue = Partial<
  Record<EndpointSchemaGeneratedKey, string>
>;

export class EndpointSchemaGenerated {
  private readonly _value: EndpointSchemaGeneratedValue;

  private constructor(value: EndpointSchemaGeneratedValue) {
    this._value = value;
  }

  static create(value: Record<string, string> | undefined): EndpointSchemaGenerated {
    const input = value ?? {};
    const invalidKeys = Object.keys(input).filter(
      (key) =>
        !VALID_ENDPOINT_SCHEMA_GENERATED_KEYS.includes(key as GenerationTarget),
    );

    if (invalidKeys.length > 0) {
      throw new Error(
        `Invalid generated schema keys: ${invalidKeys.join(', ')}. Allowed keys: ${VALID_ENDPOINT_SCHEMA_GENERATED_KEYS.join(', ')}`,
      );
    }

    return new EndpointSchemaGenerated(input as EndpointSchemaGeneratedValue);
  }

  get value(): EndpointSchemaGeneratedValue {
    return this._value;
  }

  add(
    key: EndpointSchemaGeneratedKey,
    content: string,
  ): EndpointSchemaGenerated {
    if (!content || content.trim().length === 0) {
      throw new Error(`Generated content for "${key}" cannot be empty`);
    }

    return EndpointSchemaGenerated.create({
      ...this._value,
      [key]: content,
    });
  }
}
