import { Catch, Inject } from '@nestjs/common';
import type { ArgumentsHost } from '@nestjs/common';
import type { Response, Request } from 'express';
import { HttpStatus } from '@nestjs/common';
import { DomainException } from '../../domain/exceptions';
import { LoggerProvider } from '../../constants';
import type { Logger } from 'winston';
import type { HttpExceptionResponse } from '../http/http-exception-response.interface';
import type { ApiErrorResponse } from '../http/api-response.interface';
import { BaseExceptionToHttpMapper } from '../http/exception-to-http.mapper.base';

// Import module exception mappers (add more as modules are implemented)
import { ExceptionToHttpMapper as UsersExceptionToHttpMapper } from '../../../users/adapters/inbound/http/mappers/exception-to-http.mapper';
import { ExceptionToHttpMapper as RetryExceptionToHttpMapper } from '../../../retry/adapters/inbound/http/mappers/exception-to-http.mapper';
import { ExceptionToHttpMapper as CliTokenExceptionToHttpMapper } from '../../../cli-token/adapters/inbound/http/mappers/exception-to-http.mapper';

type ExceptionMapperType = {
  map: (exception: DomainException, path?: string) => HttpExceptionResponse;
};

/**
 * Global domain exception filter.
 * Handles domain exceptions thrown from guards, interceptors, or other places
 * outside of controllers by trying all module mappers in order.
 *
 * This filter is registered globally to catch exceptions that occur before
 * controller-level filters can handle them (e.g., from AuthGuard).
 */
@Catch(DomainException)
export class GlobalDomainExceptionFilter {
  private readonly mappers: ExceptionMapperType[] = [
    UsersExceptionToHttpMapper,
    RetryExceptionToHttpMapper,
    CliTokenExceptionToHttpMapper,
  ];

  constructor(
    @Inject(LoggerProvider)
    private readonly logger: Logger,
  ) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Try each mapper until one handles the exception (doesn't return 500)
    let errorResponse: HttpExceptionResponse | null = null;

    for (const mapper of this.mappers) {
      const mappedResponse = mapper.map(exception, request.url);
      // If the mapper returned a non-500 status, it handled the exception.
      // We only compare numeric values, since enums are not guaranteed to match (see: https://github.com/nestjs/nest/issues/9917)
      if (
        typeof mappedResponse.statusCode === 'number' &&
        mappedResponse.statusCode !== 500
      ) {
        errorResponse = mappedResponse;
        break;
      }
    }

    // If no mapper handled it, use the first mapper's response (will be 500)
    // This should never happen since we have mappers, but TypeScript needs the check
    if (!errorResponse && this.mappers.length > 0) {
      const firstMapper = this.mappers[0];
      if (firstMapper) {
        errorResponse = firstMapper.map(exception, request.url);
      }
    }

    // Fallback if somehow no mappers exist (should never happen)
    if (!errorResponse) {
      errorResponse = {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message,
        error: 'Internal Server Error',
        code: exception.code,
        metadata: exception.metadata,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    this.logger.warn(
      `Domain exception: ${exception.code} - ${exception.message}`,
      {
        code: exception.code,
        metadata: exception.metadata,
        path: request.url,
        method: request.method,
        statusCode: errorResponse.statusCode,
      },
    );

    const apiErrorResponse: ApiErrorResponse = {
      error: errorResponse,
    };

    response.status(errorResponse.statusCode).json(apiErrorResponse);
  }
}
