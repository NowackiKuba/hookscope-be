import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserCLITokenQuery } from './get-user-cli-token.query';
import { Inject } from '@nestjs/common';
import { Token } from '@cli-token/constants';
import { CLITokenRepositoryPort } from '@cli-token/domain/ports/outbound/persistence/repositories/cli-token.repository.port';
import { CLIToken } from '@cli-token/domain/aggregates/cli-token';

@QueryHandler(GetUserCLITokenQuery)
export class GetUserCLITokenHandler implements IQueryHandler<GetUserCLITokenQuery> {
  constructor(
    @Inject(Token.CLIToken)
    private readonly cliTokenRepository: CLITokenRepositoryPort,
  ) {}

  async execute(query: GetUserCLITokenQuery): Promise<CLIToken | null> {
    const token = await this.cliTokenRepository.findByUserId(
      query.payload.userId,
    );

    return token ?? null;
  }
}
