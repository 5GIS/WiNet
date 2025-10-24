import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { createHmac } from 'crypto';

interface RequestWithRawBody extends Request {
  rawBody?: Buffer;
}

@Injectable()
export class HmacGuard implements CanActivate {
  private readonly webhookSecret: string | undefined;

  constructor() {
    this.webhookSecret = process.env.WEBHOOK_SECRET;
  }

  canActivate(context: ExecutionContext): boolean {
    if (!this.webhookSecret) {
      throw new UnauthorizedException('WEBHOOK_SECRET not configured - webhook endpoint is disabled');
    }

    const request = context.switchToHttp().getRequest<RequestWithRawBody>();
    
    const signature = request.headers['x-hmac-signature'] as string;
    const timestamp = request.headers['x-timestamp'] as string;

    if (!signature || !timestamp) {
      throw new UnauthorizedException('Missing HMAC signature or timestamp');
    }

    const now = Math.floor(Date.now() / 1000);
    const requestTime = parseInt(timestamp, 10);

    if (now - requestTime > 300) {
      throw new UnauthorizedException('Request timestamp expired (max 5 minutes)');
    }

    const rawBody = request.rawBody || Buffer.from(JSON.stringify(request.body));
    
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(Buffer.concat([rawBody, Buffer.from(timestamp)]))
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    return true;
  }
}
