import type { HttpExceptionResponse } from '@shared/infrastructure/http/http-exception-response.interface';
import { HttpStatus } from '@nestjs/common';
import { DomainException } from '@shared/domain/exceptions';
import { UserNotFoundException } from '@auth/domain/exceptions';
import { UsernameAlreadyExistsException } from '@users/domain/exceptions/username-already-exists.exception';

export class ExceptionToHttpMapper {
  static map(exception: DomainException, _path?: string): HttpExceptionResponse {
    if (exception instanceof UserNotFoundException) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        message: exception.message,
        error: 'Not Found',
        code: exception.code,
        metadata: exception.metadata,
        timestamp: new Date().toISOString(),
        path: _path ?? '',
      };
    }
    if (exception instanceof UsernameAlreadyExistsException) {
      return {
        statusCode: HttpStatus.CONFLICT,
        message: exception.message,
        error: 'Conflict',
        code: exception.code,
        metadata: exception.metadata,
        timestamp: new Date().toISOString(),
        path: _path ?? '',
      };
    }
    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: exception.message,
      error: 'Internal Server Error',
      code: exception.code,
      metadata: exception.metadata,
      timestamp: new Date().toISOString(),
      path: _path ?? '',
    };
  }
}
