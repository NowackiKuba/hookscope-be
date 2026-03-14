import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../../../../shared/domain/exceptions';
import {
  BaseExceptionToHttpMapper,
  type HttpExceptionResponse,
} from '../../../../../shared/infrastructure/http';
import { getErrorMessagePl } from '../../../../../shared/constants/error-messages.pl';
import {
  MissingTokenException,
  InvalidTokenException,
  UserNotFoundException,
  SessionExpiredException,
  InsufficientTokensException,
} from '../../../../domain/exceptions';

export class ExceptionToHttpMapper extends BaseExceptionToHttpMapper {
  static map(exception: DomainException, path?: string): HttpExceptionResponse {
    const messagePl = getErrorMessagePl(exception.code);

    if (
      exception instanceof MissingTokenException ||
      exception instanceof InvalidTokenException ||
      exception instanceof SessionExpiredException
    ) {
      return this.createResponse(
        exception,
        HttpStatus.UNAUTHORIZED,
        'Unauthorized',
        path,
        messagePl,
      );
    }

    if (exception instanceof UserNotFoundException) {
      return this.createResponse(
        exception,
        HttpStatus.NOT_FOUND,
        'Not Found',
        path,
        messagePl,
      );
    }

    if (exception instanceof InsufficientTokensException) {
      return this.createResponse(
        exception,
        HttpStatus.PAYMENT_REQUIRED,
        'Payment Required',
        path,
        messagePl,
      );
    }

    return super.map(exception, path);
  }

  static getStatusCode(exception: DomainException): HttpStatus {
    if (
      exception instanceof MissingTokenException ||
      exception instanceof InvalidTokenException ||
      exception instanceof SessionExpiredException
    ) {
      return HttpStatus.UNAUTHORIZED;
    }

    if (exception instanceof UserNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }

    if (exception instanceof InsufficientTokensException) {
      return HttpStatus.PAYMENT_REQUIRED;
    }

    return super.getStatusCode(exception);
  }
}
