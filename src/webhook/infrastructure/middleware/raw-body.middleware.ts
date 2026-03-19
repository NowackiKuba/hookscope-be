import { Injectable, NestMiddleware } from '@nestjs/common';
import { json, Request, Response, NextFunction } from 'express';

type RequestWithRawBody = Request & { rawBody?: Buffer };

@Injectable()
export class RawBodyMiddleware implements NestMiddleware {
  private readonly jsonParser = json({
    verify: (req: RequestWithRawBody, _res, buffer: Buffer) => {
      if (buffer?.length) {
        req.rawBody = Buffer.from(buffer);
      }
    },
  });

  use(req: Request, res: Response, next: NextFunction): void {
    this.jsonParser(req, res, next);
  }
}
