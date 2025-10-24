import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentIntentDto, PaymentIntentDto, WebhookEventDto, WebhookResponseDto, PaymentStatus } from './dto/payment.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  private intents: Map<string, PaymentIntentDto> = new Map();

  async createIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntentDto> {
    const intent: PaymentIntentDto = {
      id: randomUUID(),
      amount: dto.amount,
      currency: dto.currency || 'EUR',
      status: PaymentStatus.PENDING,
      clientSecret: `secret_${randomUUID()}`,
      metadata: dto.metadata,
      createdAt: new Date(),
    };

    this.intents.set(intent.id, intent);
    return intent;
  }

  async getIntent(id: string): Promise<PaymentIntentDto> {
    const intent = this.intents.get(id);
    if (!intent) {
      throw new NotFoundException('Payment intent not found');
    }
    return intent;
  }

  async processWebhook(event: WebhookEventDto): Promise<WebhookResponseDto> {
    const intent = this.intents.get(event.intentId);
    if (intent) {
      intent.status = event.status as PaymentStatus;
    }

    return {
      received: true,
      processedAt: new Date(),
    };
  }
}
