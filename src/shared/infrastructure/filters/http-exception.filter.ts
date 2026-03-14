import { Catch, HttpException, HttpStatus, Inject } from '@nestjs/common';
import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import type { Response, Request } from 'express';
import type { Logger } from 'winston';
import { LoggerProvider } from '../../constants';
import { getErrorMessagePl } from '../../constants/error-messages.pl';
import type { ApiErrorResponse } from '../http/api-response.interface';

/**
 * Type guard to check if a value is an object with a message property.
 */
function isExceptionResponseWithMessage(
  value: unknown,
): value is Record<string, unknown> & { message: unknown } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  return 'message' in value;
}

/**
 * Global HTTP exception filter.
 * Handles all HTTP exceptions (like BadRequestException from validation)
 * and formats them according to the API response structure.
 *
 * This filter runs before domain exception filters and handles:
 * - Validation errors (BadRequestException from ZodValidationPipe)
 * - Other NestJS HTTP exceptions
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    const code = this.getErrorCode(status);

    // User-facing message in Polish for non-technical users
    let message: string;
    let metadata: Record<string, unknown> | undefined;

    if (isExceptionResponseWithMessage(exceptionResponse)) {
      const responseMessage = exceptionResponse['message'];

      if (Array.isArray(responseMessage)) {
        // Validation errors from Zod - Polish headline; details stay in metadata.errors
        message = getErrorMessagePl('VALIDATION_ERROR');
        metadata = {
          errors: responseMessage,
        };
      } else if (typeof responseMessage === 'string') {
        message = getErrorMessagePl(code, responseMessage);
      } else {
        message = getErrorMessagePl(code, exception.message || undefined);
      }

      // Include any additional fields from the exception response as metadata
      const additionalMetadata: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(exceptionResponse)) {
        if (key !== 'message' && key !== 'statusCode' && key !== 'error') {
          additionalMetadata[key] = value;
        }
      }
      if (Object.keys(additionalMetadata).length > 0) {
        metadata = { ...metadata, ...additionalMetadata };
      }
    } else {
      message = getErrorMessagePl(code, exception.message || undefined);
    }

    const errorResponse: ApiErrorResponse['error'] = {
      statusCode: status,
      message,
      error: this.getErrorName(status),
      code,
      metadata,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log validation errors at info level, other HTTP errors at warn level
    const isBadRequest = status === HttpStatus.BAD_REQUEST;
    if (isBadRequest) {
      this.logger.info(`Validation error: ${message}`, {
        statusCode: status,
        path: request.url,
        method: request.method,
        metadata,
      });
    } else {
      this.logger.warn(`HTTP exception: ${message}`, {
        statusCode: status,
        path: request.url,
        method: request.method,
        metadata,
      });
    }

    const apiErrorResponse: ApiErrorResponse = {
      error: errorResponse,
    };

    response.status(status).json(apiErrorResponse);
  }

  private getErrorName(status: number): string {
    const statusTextMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'Bad Request',
      [HttpStatus.UNAUTHORIZED]: 'Unauthorized',
      [HttpStatus.FORBIDDEN]: 'Forbidden',
      [HttpStatus.NOT_FOUND]: 'Not Found',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'Method Not Allowed',
      [HttpStatus.CONFLICT]: 'Conflict',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'Unprocessable Entity',
      [HttpStatus.TOO_MANY_REQUESTS]: 'Too Many Requests',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'Internal Server Error',
    };

    return statusTextMap[status] || 'Error';
  }

  private getErrorCode(status: number): string {
    const codeMap: Record<number, string> = {
      [HttpStatus.BAD_REQUEST]: 'VALIDATION_ERROR',
      [HttpStatus.UNAUTHORIZED]: 'UNAUTHORIZED',
      [HttpStatus.FORBIDDEN]: 'FORBIDDEN',
      [HttpStatus.NOT_FOUND]: 'NOT_FOUND',
      [HttpStatus.METHOD_NOT_ALLOWED]: 'METHOD_NOT_ALLOWED',
      [HttpStatus.CONFLICT]: 'CONFLICT',
      [HttpStatus.UNPROCESSABLE_ENTITY]: 'UNPROCESSABLE_ENTITY',
      [HttpStatus.TOO_MANY_REQUESTS]: 'TOO_MANY_REQUESTS',
      [HttpStatus.INTERNAL_SERVER_ERROR]: 'INTERNAL_SERVER_ERROR',
    };

    return codeMap[status] || 'HTTP_ERROR';
  }
}
