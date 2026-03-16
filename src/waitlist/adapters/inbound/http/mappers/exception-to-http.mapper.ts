import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@shared/domain/exceptions';
import {
  BaseExceptionToHttpMapper,
  type HttpExceptionResponse,
} from '@shared/infrastructure/http';
import { getErrorMessagePl } from '@shared/constants/error-messages.pl';
import { WaitlistAlreadyExistsException } from '@waitlist/domain/exceptions/waitlist-already-exists.exception';
import { WaitlistValidationException } from '@waitlist/domain/exceptions/waitlist-validation.exception';

export class ExceptionToHttpMapper extends BaseExceptionToHttpMapper {
  static map(exception: DomainException, path?: string): HttpExceptionResponse {
    const messagePl = getErrorMessagePl(exception.code, exception.message);

    if (exception instanceof WaitlistAlreadyExistsException) {
      return this.createResponse(
        exception,
        HttpStatus.CONFLICT,
        'Conflict',
        path,
        messagePl,
      );
    }

    if (exception instanceof WaitlistValidationException) {
      return this.createResponse(
        exception,
        HttpStatus.BAD_REQUEST,
        'Bad Request',
        path,
        messagePl,
      );
    }

    return super.map(exception, path);
  }

  static getStatusCode(exception: DomainException): HttpStatus {
    if (exception instanceof WaitlistAlreadyExistsException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof WaitlistValidationException) {
      return HttpStatus.BAD_REQUEST;
    }
    return super.getStatusCode(exception);
  }
}
