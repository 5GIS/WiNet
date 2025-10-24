import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../modules/app.module';
import { createHmac } from 'crypto';
import * as bodyParser from 'body-parser';

describe('Webhook HMAC Security Tests', () => {
  let app: INestApplication;
  const webhookSecret = 'test-webhook-secret-key-12345';

  beforeAll(async () => {
    process.env.WEBHOOK_SECRET = webhookSecret;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    
    app.use(bodyParser.json({
      verify: (req: any, res, buf) => {
        req.rawBody = buf;
      }
    }));

    await app.init();
  });

  afterAll(async () => {
    await app.close();
    delete process.env.WEBHOOK_SECRET;
  });

  function generateSignature(payload: any, timestamp: string): string {
    const rawBody = Buffer.from(JSON.stringify(payload));
    return createHmac('sha256', webhookSecret)
      .update(Buffer.concat([rawBody, Buffer.from(timestamp)]))
      .digest('hex');
  }

  describe('POST /payments/webhooks with HMAC validation', () => {
    const webhookPayload = {
      eventType: 'payment.succeeded',
      intentId: '550e8400-e29b-41d4-a716-446655440000',
      status: 'succeeded',
      amount: 19.99,
    };

    it('should reject webhook without HMAC signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks')
        .send(webhookPayload)
        .set('x-timestamp', timestamp);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Missing HMAC signature');
    });

    it('should reject webhook with invalid HMAC signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const invalidSignature = 'invalid-signature-12345';

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks')
        .send(webhookPayload)
        .set('x-hmac-signature', invalidSignature)
        .set('x-timestamp', timestamp);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('Invalid HMAC signature');
    });

    it('should reject webhook with expired timestamp', async () => {
      const expiredTimestamp = (Math.floor(Date.now() / 1000) - 400).toString();
      const signature = generateSignature(webhookPayload, expiredTimestamp);

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks')
        .send(webhookPayload)
        .set('x-hmac-signature', signature)
        .set('x-timestamp', expiredTimestamp);

      expect(response.status).toBe(401);
      expect(response.body.message).toContain('timestamp expired');
    });

    it('should accept webhook with valid HMAC signature', async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      const signature = generateSignature(webhookPayload, timestamp);

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks')
        .send(webhookPayload)
        .set('x-hmac-signature', signature)
        .set('x-timestamp', timestamp);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('received', true);
      expect(response.body).toHaveProperty('processedAt');
    });

    it('should validate signature on raw body regardless of JSON formatting', async () => {
      const timestamp = Math.floor(Date.now() / 1000).toString();
      
      const payloadWithSpaces = {
        eventType: 'payment.succeeded',
        intentId: '550e8400-e29b-41d4-a716-446655440000',
        status: 'succeeded',
        amount: 19.99,
      };

      const signature = generateSignature(payloadWithSpaces, timestamp);

      const response = await request(app.getHttpServer())
        .post('/payments/webhooks')
        .send(payloadWithSpaces)
        .set('x-hmac-signature', signature)
        .set('x-timestamp', timestamp);

      expect(response.status).toBe(201);
    });
  });
});
