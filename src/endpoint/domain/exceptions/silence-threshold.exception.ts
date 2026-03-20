import { DomainException } from '@shared/domain/exceptions';

export class SilenceThresholdTooLowException extends DomainException {
  constructor(value: number, min: number) {
    super(
      `Silence threshold ${value} is too low. Minimum is ${min} minutes.`,
      'SILENCE_THRESHOLD_TOO_LOW',
      { value, min },
    );
  }
}

export class SilenceThresholdTooHighException extends DomainException {
  constructor(value: number, max: number) {
    super(
      `Silence threshold ${value} is too high. Maximum is ${max} minutes.`,
      'SILENCE_THRESHOLD_TOO_HIGH',
      { value, max },
    );
  }
}
