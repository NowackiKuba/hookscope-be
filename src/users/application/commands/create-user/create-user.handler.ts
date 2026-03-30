import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserCommand } from './create-user.command';
import { User } from '@users/domain/aggregates/user';
import type { UserRepositoryPort } from '@users/domain/ports/outbound/persistence/repositories/user.repository.port';
import { Inject } from '@nestjs/common';
import { Token } from '@users/constants';
import { Email } from '@users/domain/value-objects/user-email.vo';
import { CreateUserSettingsCommand } from '@user-settings/application/commands/create-user-settings/create-user-settings.command';
import { CreateEndpointDirectoryCommand } from '@endpoint/application/commands/create-endpoint-directory/create-endpoint-directory.command';
import { generateUUID } from '@shared/utils/generate-uuid';

@CommandHandler(CreateUserCommand)
export class CreateUserHandler implements ICommandHandler<CreateUserCommand> {
  constructor(
    @Inject(Token.UserRepository)
    private readonly userRepository: UserRepositoryPort,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: CreateUserCommand): Promise<string> {
    const { id, firstName, lastName, email, password } = command.payload;
    Email.create(email); // validate
    const username = this.deriveUsername(email, id);
    const user = User.create({
      id,
      firstName,
      lastName,
      username,
      email,
      passwordHash: password,
    });
    const created = await this.userRepository.create(user);

    await this.commandBus.execute(
      new CreateUserSettingsCommand({ userId: created.id.value }),
    );

    await this.commandBus.execute(
      new CreateEndpointDirectoryCommand({
        id: generateUUID(),
        name: 'Default',
        userId: user.id.value,
        color: 'slate',
        icon: 'Folder',
      }),
    );

    return created.id.value;
  }

  private deriveUsername(email: string, id: string): string {
    const local =
      email.split('@')[0]?.replace(/[^a-zA-Z0-9_-]/g, '_') ?? 'user';
    const suffix = id.slice(0, 8);
    return `${local}_${suffix}`;
  }
}
