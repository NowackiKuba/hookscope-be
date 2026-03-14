import { generateUUID } from '../../utils/generate-uuid';

/**
 * Base class for ID value objects.
 * Provides common functionality for generating and managing ID values.
 *
 * All ID value objects should extend this class to automatically get the `generate()` method
 * and consistent structure. The `generate()` method is automatically available on all subclasses.
 *
 * @example
 * ```typescript
 * export class PromptId extends BaseId {
 *   protected constructor(value: string) {
 *     super(value);
 *   }
 *
 *   static create(value: string): PromptId {
 *     if (!value) {
 *       throw new Error('PromptId cannot be empty');
 *     }
 *     return new PromptId(value);
 *   }
 *
 *   static generate(): PromptId {
 *     return new PromptId(BaseId.generateUuid());
 *   }
 *
 *   equals(other: PromptId): boolean {
 *     return this.value === other.value;
 *   }
 * }
 * ```
 */
export abstract class BaseId {
  protected readonly _value: string;

  protected constructor(value: string) {
    this._value = value;
  }

  /**
   * Creates an ID value object from a string value.
   * Must be implemented by subclasses to provide validation.
   *
   * @param value - The string value to create the ID from
   * @returns A new instance of the ID value object
   * @throws Error if the value is invalid
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static create(value: string): BaseId {
    throw new Error('create() must be implemented by subclass');
  }

  /**
   * Generates a random UUID string.
   * Subclasses should implement their own `generate()` method using this helper:
   * `static generate(): SubclassId { return new SubclassId(BaseId.generateUuid()); }`
   *
   * @returns A UUID string
   */
  protected static generateUuid(): string {
    return generateUUID();
  }

  /**
   * Gets the string value of the ID.
   */
  get value(): string {
    return this._value;
  }

  /**
   * Checks if this ID equals another ID.
   * Should be overridden by subclasses for type safety.
   *
   * @param other - The other ID to compare with
   * @returns True if the IDs are equal, false otherwise
   */
  equals(other: BaseId): boolean {
    return this._value === other._value;
  }
}
