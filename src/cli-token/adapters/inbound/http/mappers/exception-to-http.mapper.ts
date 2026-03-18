import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@shared/domain/exceptions';
import {
  BaseExceptionToHttpMapper,
  type HttpExceptionResponse,
} from '@shared/infrastructure/http';
import { getErrorMessagePl } from '@shared/constants/error-messages.pl';
import { CLITokenNotFoundException } from '@cli-token/domain/exceptions/cli-token-not-found.exception';
import { CLITokenAlreadyExistsException } from '@cli-token/domain/exceptions/cli-token-already-exists.exception';
import { CLITokenForbiddenException } from '@cli-token/domain/exceptions/cli-token-forbidden.exception';

export class ExceptionToHttpMapper extends BaseExceptionToHttpMapper {
  static map(exception: DomainException, path?: string): HttpExceptionResponse {
    const messagePl = getErrorMessagePl(exception.code, exception.message);

    if (exception instanceof CLITokenNotFoundException) {
      return this.createResponse(
        exception,
        HttpStatus.NOT_FOUND,
        'Not Found',
        path,
        messagePl,
      );
    }

    if (exception instanceof CLITokenAlreadyExistsException) {
      return this.createResponse(
        exception,
        HttpStatus.CONFLICT,
        'Conflict',
        path,
        messagePl,
      );
    }

    if (exception instanceof CLITokenForbiddenException) {
      return this.createResponse(
        exception,
        HttpStatus.FORBIDDEN,
        'Forbidden',
        path,
        messagePl,
      );
    }

    return super.map(exception, path);
  }

  static getStatusCode(exception: DomainException): HttpStatus {
    if (exception instanceof CLITokenNotFoundException) {
      return HttpStatus.NOT_FOUND;
    }
    if (exception instanceof CLITokenAlreadyExistsException) {
      return HttpStatus.CONFLICT;
    }
    if (exception instanceof CLITokenForbiddenException) {
      return HttpStatus.FORBIDDEN;
    }
    return super.getStatusCode(exception);
  }
}
