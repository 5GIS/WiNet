import { IsNumber, IsString, IsUUID, IsOptional, IsObject, IsEnum, Min } from 'class-validator';

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SUCCEEDED = 'succeeded',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export class CreatePaymentIntentDto {
  @IsNumber()
  @Min(0)
  amount: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsUUID()
  offerId: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class PaymentIntentDto {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  clientSecret: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export class WebhookEventDto {
  @IsEnum(['payment.succeeded', 'payment.failed', 'payment.refunded'])
  eventType: string;

  @IsUUID()
  intentId: string;

  @IsNumber()
  amount: number;

  @IsString()
  status: string;

  @IsString()
  timestamp: string;
}

export class WebhookResponseDto {
  received: boolean;
  processedAt: Date;
}
