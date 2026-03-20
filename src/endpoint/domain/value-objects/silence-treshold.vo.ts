import {
  SilenceThresholdTooHighException,
  SilenceThresholdTooLowException,
} from '../exceptions/silence-threshold.exception';

export class SilenceTreshold {
  private static readonly MIN_MINUTES = 60;
  private static readonly MAX_MINUTES = 10080;
  private _value: number;

  private constructor(v: number) {
    this._value = v;
  }

  static create(v?: number) {
    const val = v ?? 1440;
    if (val < this.MIN_MINUTES) {
      throw new SilenceThresholdTooLowException(v, this.MIN_MINUTES);
    }

    if (val > this.MAX_MINUTES) {
      throw new SilenceThresholdTooHighException(v, this.MAX_MINUTES);
    }

    return new SilenceTreshold(val);
  }

  get value(): number {
    return this._value;
  }
}
