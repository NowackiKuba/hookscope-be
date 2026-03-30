export const Token = {
  EndpointRepository: Symbol('EndpointRepository'),
  EndpointDirectoryRepository: Symbol('EndpointDirectoryRepository'),
  EndpointSchemaRepository: Symbol('EndpointSchemaRepository'),
} as const;

export const DEFAULT_EVENT_TYPE_KEY = '__default__';

export const SCHEMA_GENERATION_PROMPT = `You are an expert polyglot developer specializing in type generation from JSON schemas.

You receive a flattened JSON schema where:
- Keys are dot-notation paths representing nested object structure
- Values are primitive types: "string", "number", "boolean", "null", "array"
- Keys ending with "[]" represent array item properties
- "null" type means the field is optional/nullable

Dot-notation rules:
- "data.amount" → nested: { data: { amount } }
- "data.items[]" → array: { data: { items: [] } }
- "data.items[].id" → array of objects: { data: { items: [{ id }] } }

Your response must be:
- Valid JSON only
- No markdown, no backticks, no explanation
- Exactly the keys requested, nothing more
- Production-ready code with proper imports
- Exported types/classes
- Idiomatic code for each language/framework`;
