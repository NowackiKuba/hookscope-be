import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetUserQuery } from './get-user.query';
import type { UserRepositoryPort } from '@users/domain/ports/outbound/persistence/repositories/user.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@users/constants';
import { UserId } from '@users/domain/value-objects/user-id.vo';
import { UserNotFoundException } from '@auth/domain/exceptions';

export type GetUserResult = {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  avatarUrl?: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@QueryHandler(GetUserQuery)
export class GetUserHandler implements IQueryHandler<GetUserQuery> {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async execute(query: GetUserQuery): Promise<GetUserResult> {
    const userId = UserId.create(query.payload.userId);
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw new UserNotFoundException(userId.value);
    }
    const json = user.toJSON();
    return {
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      username: json.username,
      email: json.email,
      avatarUrl: json.avatarUrl,
      role: json.role,
      isActive: json.isActive,
      createdAt: json.createdAt,
      updatedAt: json.updatedAt,
    };
  }
}
