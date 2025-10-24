import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash passwords
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const managerPasswordHash = await bcrypt.hash('manager123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@winet.demo' },
    update: {},
    create: {
      email: 'admin@winet.demo',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create manager user
  const manager = await prisma.user.upsert({
    where: { email: 'manager@winet.demo' },
    update: {},
    create: {
      email: 'manager@winet.demo',
      passwordHash: managerPasswordHash,
      role: 'MANAGER',
    },
  });
  console.log('✅ Manager user created:', manager.email);

  // Create demo router
  const routerSecretHash = await bcrypt.hash('admin', 10);
  const router = await prisma.router.upsert({
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
  console.log('✅ Demo router created:', router.serialNumber);

  // Create offers
  const offer1h = await prisma.offer.upsert({
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
  console.log('✅ 1h offer created:', offer1h.name);

  const offer24h = await prisma.offer.upsert({
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
  console.log('✅ 24h offer created:', offer24h.name);

  // Create themes
  const freeTheme = await prisma.theme.upsert({
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
  console.log('✅ Free theme created:', freeTheme.name);

  const premiumTheme = await prisma.theme.upsert({
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
  console.log('✅ Premium theme created:', premiumTheme.name);

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
