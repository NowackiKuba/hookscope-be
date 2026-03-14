import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@shared/domain/exceptions';
import {
  BaseExceptionToHttpMapper,
  type HttpExceptionResponse,
} from '@shared/infrastructure/http';
import { getErrorMessagePl } from '@shared/constants/error-messages.pl';
import { RequestNotFoundException } from '@request/domain/exceptions/request-not-found.exception';
import { EndpointNotFoundException } from '@endpoint/domain/exceptions/endpoint-not-found.exception';

export class ExceptionToHttpMapper extends BaseExceptionToHttpMapper {
  static map(exception: DomainException, path?: string): HttpExceptionResponse {
    const messagePl = getErrorMessagePl(exception.code, exception.message);

    if (
      exception instanceof RequestNotFoundException ||
      exception instanceof EndpointNotFoundException
    ) {
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
    if (
      exception instanceof RequestNotFoundException ||
      exception instanceof EndpointNotFoundException
    ) {
      return HttpStatus.NOT_FOUND;
    }
    return super.getStatusCode(exception);
  }
}
