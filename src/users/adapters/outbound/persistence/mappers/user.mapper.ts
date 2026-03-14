import { Injectable } from '@nestjs/common';
import { User } from '@users/domain/aggregates/user';
import { UserEntity } from '@users/adapters/outbound/persistence/entities/user.entity';
import { UserRole } from '@users/domain/enums/user-role.enum';

@Injectable()
export class UserMapper {
  toDomain(entity: UserEntity): User {
    const role =
      entity.role === 'ADMIN' ? UserRole.ADMIN : UserRole.USER;
    return User.create({
      id: entity.id,
      firstName: entity.firstName,
      lastName: entity.lastName,
      username: entity.username,
      email: entity.email,
      passwordHash: entity.passwordHash,
      avatarUrl: entity.avatarUrl,
      role,
      isActive: entity.isActive,
      resetPasswordToken: entity.resetPasswordToken ?? null,
      resetPasswordTokenExpiresAt: entity.resetPasswordTokenExpiresAt ?? null,
      createdBy: entity.createdBy ?? null,
      createdById: entity.createdById ?? null,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  toPersistence(user: User): UserEntity {
    const json = user.toJSON();
    const roleDb: string = json.role === UserRole.ADMIN ? 'ADMIN' : 'USER';
    return new UserEntity({
      id: json.id,
      firstName: json.firstName,
      lastName: json.lastName,
      username: json.username,
      email: json.email,
      passwordHash: json.passwordHash,
      avatarUrl: json.avatarUrl,
      role: roleDb,
      isActive: json.isActive,
      resetPasswordToken: json.resetPasswordToken,
      resetPasswordTokenExpiresAt: json.resetPasswordTokenExpiresAt,
      createdBy: json.createdBy,
      createdById: json.createdById,
    });
  }
}
