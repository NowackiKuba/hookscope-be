import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions';
import { getErrorMessagePl } from '../../constants/error-messages.pl';
import type { HttpExceptionResponse } from './http-exception-response.interface';

/**
 * Base class for mapping domain exceptions to HTTP responses.
 * Each module should extend this class and implement module-specific exception mappings.
 *
 * @example
 * ```typescript
 * export class ExceptionToHttpMapper extends BaseExceptionToHttpMapper {
 *   static map(exception: DomainException, path?: string): HttpExceptionResponse {
 *     if (exception instanceof UserNotFoundException) {
 *       return this.createResponse(exception, HttpStatus.NOT_FOUND, 'Not Found', path);
 *     }
 *     return super.map(exception, path);
 *   }
 * }
 * ```
 */
export abstract class BaseExceptionToHttpMapper {
  /**
   * Creates a base HTTP exception response with common fields.
   * @param messageOverride - Optional user-facing message (e.g. Polish); defaults to exception.message
   */
  protected static createBaseResponse(
    exception: DomainException,
    path?: string,
    messageOverride?: string,
  ): Omit<HttpExceptionResponse, 'statusCode' | 'error'> {
    return {
      code: exception.code,
      message: messageOverride ?? exception.message,
      metadata: exception.metadata,
      timestamp: new Date().toISOString(),
      path,
    };
  }

  /**
   * Creates a complete HTTP exception response.
   * @param messageOverride - Optional user-facing message (e.g. Polish); defaults to exception.message
   */
  protected static createResponse(
    exception: DomainException,
    statusCode: HttpStatus,
    error: string,
    path?: string,
    messageOverride?: string,
  ): HttpExceptionResponse {
    return {
      ...this.createBaseResponse(exception, path, messageOverride),
      statusCode,
      error,
    };
  }

  /**
   * Maps a domain exception to an HTTP exception response.
   * This method should be overridden in each module to handle module-specific exceptions.
   */
  static map(exception: DomainException, path?: string): HttpExceptionResponse {
    const messagePl = getErrorMessagePl(exception.code, exception.message);
    return this.createResponse(
      exception,
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal Server Error',
      path,
      messagePl,
    );
  }

  /**
   * Gets the HTTP status code for a domain exception.
   * This method should be overridden in each module to handle module-specific exceptions.
   */
  static getStatusCode(exception: DomainException): HttpStatus {
    // Default fallback status code
    return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}
