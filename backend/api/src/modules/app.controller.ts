import { Controller, Get, Post, ForbiddenException, UnauthorizedException, Headers } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from '../common/prisma.service';
import * as bcrypt from 'bcrypt';

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
    // Security: Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      throw new ForbiddenException('Debug endpoint disabled in production');
    }

    const [users, offers, routers, themes] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, email: true, role: true } }),
      this.prisma.offer.findMany({ select: { id: true, name: true, priceCents: true, active: true } }),
      this.prisma.router.findMany({ select: { id: true, serialNumber: true, ssid: true, status: true } }),
      this.prisma.theme.findMany({ select: { id: true, name: true, tier: true } }),
    ]);

    return {
      message: 'Database seed data (development only)',
      environment: process.env.NODE_ENV || 'development',
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

  @Post('admin/seed')
  async adminSeed(@Headers('authorization') authHeader: string) {
    const adminSecret = process.env.ADMIN_SECRET;
    
    if (!adminSecret) {
      throw new ForbiddenException('Admin endpoint not configured');
    }

    const token = authHeader?.replace('Bearer ', '');
    if (token !== adminSecret) {
      throw new UnauthorizedException('Invalid admin secret');
    }

    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const managerPasswordHash = await bcrypt.hash('manager123', 10);
    const routerSecretHash = await bcrypt.hash('admin', 10);

    const admin = await this.prisma.user.upsert({
      where: { email: 'admin@winet.demo' },
      update: {},
      create: {
        email: 'admin@winet.demo',
        passwordHash: adminPasswordHash,
        role: 'ADMIN',
      },
    });

    const manager = await this.prisma.user.upsert({
      where: { email: 'manager@winet.demo' },
      update: {},
      create: {
        email: 'manager@winet.demo',
        passwordHash: managerPasswordHash,
        role: 'MANAGER',
      },
    });

    const router = await this.prisma.router.upsert({
      where: { serialNumber: 'SN-DEMO-001' },
      update: {},
      create: {
        serialNumber: 'SN-DEMO-001',
        ssid: 'WiNet-Demo',
        adminSecretHash: routerSecretHash,
        status: 'ONLINE',
        lastSeenAt: new Date(),
      },
    });

    const offer1h = await this.prisma.offer.upsert({
      where: { id: '1h-offer' },
      update: {},
      create: {
        id: '1h-offer',
        name: '1 Hour Access',
        priceCents: 500,
        durationMinutes: 60,
        bandwidthLimitKbps: 5120,
        active: true,
      },
    });

    const offer24h = await this.prisma.offer.upsert({
      where: { id: '24h-offer' },
      update: {},
      create: {
        id: '24h-offer',
        name: '24 Hours Access',
        priceCents: 2000,
        durationMinutes: 1440,
        bandwidthLimitKbps: 10240,
        active: true,
      },
    });

    const freeTheme = await this.prisma.theme.upsert({
      where: { id: 'theme-free-default' },
      update: {},
      create: {
        id: 'theme-free-default',
        name: 'Default Free Theme',
        tier: 'FREE',
        manifestJson: JSON.stringify({
          primaryColor: '#4F46E5',
          logo: '/assets/logo-default.png',
          backgroundColor: '#FFFFFF',
        }),
      },
    });

    const premiumTheme = await this.prisma.theme.upsert({
      where: { id: 'theme-premium-luxury' },
      update: {},
      create: {
        id: 'theme-premium-luxury',
        name: 'Luxury Premium Theme',
        tier: 'PREMIUM',
        manifestJson: JSON.stringify({
          primaryColor: '#D97706',
          logo: '/assets/logo-premium.png',
          backgroundColor: '#1F2937',
          customCSS: 'body { font-family: "Playfair Display", serif; }',
        }),
      },
    });

    return {
      success: true,
      message: 'Database initialized successfully',
      created: {
        users: [admin.email, manager.email],
        routers: [router.serialNumber],
        offers: [offer1h.name, offer24h.name],
        themes: [freeTheme.name, premiumTheme.name],
      },
    };
  }
}
