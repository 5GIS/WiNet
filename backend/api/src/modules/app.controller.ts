import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from '../common/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  root() { return { ok: true, service: 'WiNet API', docs: '/health' }; }

  @Get('health')
  health() { return { status: 'ok', ts: new Date().toISOString() }; }

  @Get('debug/seed')
  async debugSeed() {
    const [users, offers, routers, themes] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, email: true, role: true } }),
      this.prisma.offer.findMany({ select: { id: true, name: true, priceCents: true, active: true } }),
      this.prisma.router.findMany({ select: { id: true, serialNumber: true, ssid: true, status: true } }),
      this.prisma.theme.findMany({ select: { id: true, name: true, tier: true } }),
    ]);

    return {
      message: 'Database seed data',
      counts: {
        users: users.length,
        offers: offers.length,
        routers: routers.length,
        themes: themes.length,
      },
      data: {
        users,
        offers,
        routers,
        themes,
      },
    };
  }
}
