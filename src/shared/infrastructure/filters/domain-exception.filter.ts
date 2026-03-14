import { Catch, Inject } from '@nestjs/common';
import type { Logger } from 'winston';
import type { ArgumentsHost } from '@nestjs/common';
import type { Response, Request } from 'express';
import { DomainException } from '../../domain/exceptions';
import { LoggerProvider } from '../../constants';
import type { HttpExceptionResponse } from '../http/http-exception-response.interface';
import type { ApiErrorResponse } from '../http/api-response.interface';
import type { BaseExceptionToHttpMapper } from '../http/exception-to-http.mapper.base';

/**
 * Base domain exception filter.
 * This filter catches all DomainException instances and converts them to HTTP responses.
 *
 * Each module should extend this class and provide its own ExceptionToHttpMapper.
 *
 * @example
 * ```typescript
 * @Catch(DomainException)
 * export class DomainExceptionFilter extends BaseDomainExceptionFilter {
 *   constructor(
 *     @Inject(LoggerProvider) logger: Logger,
 *   ) {
 *     super(logger);
 *   }
 * }
 * ```
 */
@Catch(DomainException)
export abstract class BaseDomainExceptionFilter {
  protected abstract readonly mapper: typeof BaseExceptionToHttpMapper;

  constructor(
    @Inject(LoggerProvider)
    protected readonly logger: Logger,
  ) {}

  catch(exception: DomainException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse: HttpExceptionResponse = this.mapper.map(
      exception,
      request.url,
    );

    this.logger.warn(
      `Domain exception: ${exception.code} - ${exception.message}`,
      {
        code: exception.code,
        metadata: exception.metadata,
        path: request.url,
        method: request.method,
      },
    );

    const apiErrorResponse: ApiErrorResponse = {
      error: errorResponse,
    };

    response.status(errorResponse.statusCode).json(apiErrorResponse);
  }
}
