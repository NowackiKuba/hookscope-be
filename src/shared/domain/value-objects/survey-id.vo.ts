import { BaseId } from './base-id.vo';

/**
 * Value object representing a survey identifier.
 * Used to identify surveys across the application.
 */
export class SurveyId extends BaseId {
  protected constructor(value: string) {
    super(value);
  }

  static create(value: string): SurveyId {
    if (!value || value.trim().length === 0) {
      throw new Error('SurveyId cannot be empty');
    }
    return new SurveyId(value.trim());
  }

  static generate(): SurveyId {
    return new SurveyId(BaseId.generateUuid());
  }

  equals(other: SurveyId): boolean {
    return this.value === other.value;
  }
}
