import { Injectable, NestMiddleware, ConflictException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  private requestStore: Map<string, any> = new Map();

  use(req: Request, res: Response, next: NextFunction) {
    const idempotencyKey = req.headers['idempotency-key'] as string;

    if (!idempotencyKey) {
      return next();
    }

    const storedResponse = this.requestStore.get(idempotencyKey);
    
    if (storedResponse) {
      return res.status(storedResponse.status).json(storedResponse.body);
    }

    const originalJson = res.json.bind(res);
    res.json = (body: any) => {
      this.requestStore.set(idempotencyKey, {
        status: res.statusCode,
        body,
      });

      setTimeout(() => this.requestStore.delete(idempotencyKey), 24 * 60 * 60 * 1000);

      return originalJson(body);
    };

    next();
  }
}
