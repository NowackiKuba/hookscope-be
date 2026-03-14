import { Catch, Inject } from '@nestjs/common';
import { LoggerProvider } from '../../../../../shared/constants';
import type { Logger } from 'winston';
import { DomainException } from '../../../../../shared/domain/exceptions';
import { BaseDomainExceptionFilter } from '../../../../../shared/infrastructure/filters';
import { ExceptionToHttpMapper } from '../mappers/exception-to-http.mapper';

@Catch(DomainException)
export class DomainExceptionFilter extends BaseDomainExceptionFilter {
  protected readonly mapper = ExceptionToHttpMapper;

  constructor(@Inject(LoggerProvider) logger: Logger) {
    super(logger);
  }
}
