import { HashServicePort } from '@auth/domain/ports/services/hash.service.port';
import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptAdapter implements HashServicePort {
  async compare(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async hash(password: string, salt: number): Promise<string> {
    return await bcrypt.hash(password, salt);
  }
}
