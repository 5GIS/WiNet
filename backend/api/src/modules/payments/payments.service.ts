import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePaymentIntentDto, PaymentIntentDto, WebhookEventDto, WebhookResponseDto, PaymentStatus } from './dto/payment.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async initPayment(dto: {
    type: 'ROUTER_CONFIG' | 'TEMPLATE_PURCHASE' | 'ACCESS_SALE';
    amountCents: number;
    phoneNumber: string;
    provider: 'ORANGE' | 'MTN';
    metadata?: any;
  }): Promise<any> {
    const idempotencyKey = randomUUID();
    
    const payment = await this.prisma.payment.create({
      data: {
        type: dto.type,
        amountCents: dto.amountCents,
        phoneNumber: dto.phoneNumber,
        provider: dto.provider,
        metadata: JSON.stringify(dto.metadata || {}),
        idempotencyKey,
        status: 'PENDING',
      },
    });

    return {
      paymentId: payment.id,
      status: 'PENDING',
      providerResponse: {
        transactionId: `${dto.provider}-${randomUUID().substring(0, 8)}`,
        message: `Payment request sent to ${dto.phoneNumber}`,
      },
    };
  }

  async createIntent(dto: CreatePaymentIntentDto): Promise<PaymentIntentDto> {
    const idempotencyKey = dto.metadata?.idempotencyKey || randomUUID();
    
    const payment = await this.prisma.payment.create({
      data: {
        type: 'ACCESS_SALE',
        amountCents: dto.amount,
        idempotencyKey,
        status: 'PENDING',
      },
    });

    return {
      id: payment.id,
      amount: payment.amountCents,
      currency: dto.currency || 'XOF',
      status: payment.status as PaymentStatus,
      clientSecret: `secret_${payment.id}`,
      metadata: dto.metadata,
      createdAt: payment.createdAt,
    };
  }

  async getIntent(id: string): Promise<PaymentIntentDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      throw new NotFoundException('Payment intent not found');
    }

    return {
      id: payment.id,
      amount: payment.amountCents,
      currency: 'XOF',
      status: payment.status as PaymentStatus,
      clientSecret: `secret_${payment.id}`,
      metadata: payment.metadata ? JSON.parse(payment.metadata) : undefined,
      createdAt: payment.createdAt,
    };
  }

  async processWebhook(event: WebhookEventDto): Promise<WebhookResponseDto> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: event.intentId },
    });

    if (payment) {
      await this.prisma.payment.update({
        where: { id: event.intentId },
        data: {
          status: event.status as any,
          providerRef: event.intentId,
        },
      });
    }

    return {
      received: true,
      processedAt: new Date(),
    };
  }
}
