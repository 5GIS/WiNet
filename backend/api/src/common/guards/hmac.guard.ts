import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { createHmac } from 'crypto';

@Injectable()
export class HmacGuard implements CanActivate {
  private readonly webhookSecret = process.env.WEBHOOK_SECRET || 'default-webhook-secret';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    
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

    const body = JSON.stringify(request.body);
    const expectedSignature = createHmac('sha256', this.webhookSecret)
      .update(body + timestamp)
      .digest('hex');

    if (signature !== expectedSignature) {
      throw new UnauthorizedException('Invalid HMAC signature');
    }

    return true;
  }
}
