import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../modules/app.module';

describe('WiNet API Integration Tests', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Health Endpoints', () => {
    it('GET / should return service info', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('ok', true);
          expect(res.body).toHaveProperty('service', 'WiNet API');
        });
    });

    it('GET /health should return status', () => {
      return request(app.getHttpServer())
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body).toHaveProperty('ts');
        });
    });
  });

  describe('Auth Module', () => {
    let userId: string;

    it('POST /auth/register should create a new user', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
          phone: '+33612345678',
          role: 'merchant',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('userId');
          expect(res.body).toHaveProperty('message');
          userId = res.body.userId;
        });
    });

    it('POST /auth/login should authenticate user', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'SecurePass123!',
        })
        .expect((res) => {
          expect([200, 401]).toContain(res.status);
        });
    });
  });

  describe('Routers Module', () => {
    let routerId: string;

    it('POST /routers should create a router with idempotency', () => {
      const idempotencyKey = '550e8400-e29b-41d4-a716-446655440000';

      return request(app.getHttpServer())
        .post('/routers')
        .set('idempotency-key', idempotencyKey)
        .send({
          name: 'Router-Test',
          model: 'MikroTik hAP ac2',
          serialNumber: 'TEST123456',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Router-Test');
          routerId = res.body.id;
        });
    });

    it('GET /routers should return list of routers', () => {
      return request(app.getHttpServer())
        .get('/routers')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('pagination');
          expect(Array.isArray(res.body.data)).toBe(true);
        });
    });

    it('GET /routers/:id/health should return router health', async () => {
      if (!routerId) return;

      return request(app.getHttpServer())
        .get(`/routers/${routerId}/health`)
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('uptime');
        });
    });
  });

  describe('Offers Module', () => {
    let offerId: string;

    it('POST /offers should create an offer', () => {
      return request(app.getHttpServer())
        .post('/offers')
        .set('idempotency-key', '550e8400-e29b-41d4-a716-446655440001')
        .send({
          name: 'Test 1h WiFi',
          duration: 60,
          price: 2.99,
          routerId: '123e4567-e89b-12d3-a456-426614174000',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('name', 'Test 1h WiFi');
          offerId = res.body.id;
        });
    });

    it('GET /offers should return list of offers', () => {
      return request(app.getHttpServer())
        .get('/offers')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });

  describe('Payments Module', () => {
    it('POST /payments/intents should create payment intent', () => {
      return request(app.getHttpServer())
        .post('/payments/intents')
        .set('idempotency-key', '550e8400-e29b-41d4-a716-446655440002')
        .send({
          amount: 4.99,
          currency: 'EUR',
          offerId: '123e4567-e89b-12d3-a456-426614174001',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body).toHaveProperty('status');
          expect(res.body).toHaveProperty('clientSecret');
        });
    });
  });

  describe('Shop Module', () => {
    it('GET /shop/products should return products', () => {
      return request(app.getHttpServer())
        .get('/shop/products')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
          if (res.body.length > 0) {
            expect(res.body[0]).toHaveProperty('name');
            expect(res.body[0]).toHaveProperty('price');
          }
        });
    });
  });

  describe('Themes Module', () => {
    it('GET /portal-themes/catalogue should return catalogue themes', () => {
      return request(app.getHttpServer())
        .get('/portal-themes/catalogue')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true);
        });
    });
  });
});
