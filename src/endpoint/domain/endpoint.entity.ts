import { randomBytes, randomUUID } from 'crypto';

export class Endpoint {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly name: string,
    public readonly description: string,
    public readonly token: string,
    public readonly isActive: boolean,
    public readonly targetUrl: string | null,
    public readonly secretKey: string | null,
    public readonly requestCount: number,
    public readonly lastRequestAt: Date | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(props: {
    userId: string;
    name: string;
    description?: string;
    targetUrl?: string | null;
    secretKey?: string | null;
  }): Endpoint {
    return new Endpoint(
      randomUUID(),
      props.userId,
      props.name,
      props.description ?? '',
      randomBytes(16).toString('hex'),
      true,
      props.targetUrl ?? null,
      props.secretKey ?? null,
      0,
      null,
      new Date(),
      new Date(),
    );
  }
}
