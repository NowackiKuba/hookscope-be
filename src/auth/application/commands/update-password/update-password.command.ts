import { UpdatePasswordInput } from '@auth/adapters/inbound/http/dto/update-password/update-password.schema';

export class UpdatePasswordCommand {
  constructor(public readonly payload: UpdatePasswordInput & { id: string }) {}
}
