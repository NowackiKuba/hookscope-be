import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@shared/domain/exceptions';
import {
  BaseExceptionToHttpMapper,
  type HttpExceptionResponse,
} from '@shared/infrastructure/http';
import { getErrorMessagePl } from '@shared/constants/error-messages.pl';
import { RetryNotFoundException } from '@retry/domain/exceptions';

export class ExceptionToHttpMapper extends BaseExceptionToHttpMapper {
  static map(exception: DomainException, path?: string): HttpExceptionResponse {
    const messagePl = getErrorMessagePl(exception.code, exception.message);

    if (exception instanceof RetryNotFoundException) {
      return this.createResponse(
        exception,
        HttpStatus.NOT_FOUND,
        'Not Found',
        path,
        messagePl,
      );
    }

    return super.map(exception, path);
  }

  static getStatusCode(exception: DomainException): HttpStatus {
    if (exception instanceof RetryNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    return super.getStatusCode(exception);
  }
}
