import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto, PaymentIntentDto, WebhookEventDto, WebhookResponseDto } from './dto/payment.dto';
import { HmacGuard } from '../../common/guards/hmac.guard';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('intents')
  async createIntent(@Body() dto: CreatePaymentIntentDto): Promise<PaymentIntentDto> {
    return this.paymentsService.createIntent(dto);
  }

  @Get('intents/:id')
  async getIntent(@Param('id') id: string): Promise<PaymentIntentDto> {
    return this.paymentsService.getIntent(id);
  }

  @Post('webhooks')
  @UseGuards(HmacGuard)
  async processWebhook(@Body() event: WebhookEventDto): Promise<WebhookResponseDto> {
    return this.paymentsService.processWebhook(event);
  }
}
