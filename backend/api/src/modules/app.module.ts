import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { RoutersModule } from './routers/routers.module';
import { OffersModule } from './offers/offers.module';
import { TicketsModule } from './tickets/tickets.module';
import { PaymentsModule } from './payments/payments.module';
import { ThemesModule } from './themes/themes.module';
import { TechniciansModule } from './technicians/technicians.module';
import { ShopModule } from './shop/shop.module';
import { IdempotencyMiddleware } from '../common/middleware/idempotency.middleware';
import { LoggerInterceptor } from '../common/interceptors/logger.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    RoutersModule,
    OffersModule,
    TicketsModule,
    PaymentsModule,
    ThemesModule,
    TechniciansModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IdempotencyMiddleware)
      .forRoutes('*');
  }
}
