"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppController = void 0;
const common_1 = require("@nestjs/common");
const app_service_1 = require("./app.service");
const prisma_service_1 = require("../common/prisma.service");
const bcrypt = __importStar(require("bcrypt"));
let AppController = class AppController {
    constructor(appService, prisma) {
        this.appService = appService;
        this.prisma = prisma;
    }
    root() { return { ok: true, service: 'WiNet API', docs: '/health' }; }
    health() { return { status: 'ok', ts: new Date().toISOString() }; }
    async debugSeed() {
        // Security: Only allow in development mode
        if (process.env.NODE_ENV === 'production') {
            throw new common_1.ForbiddenException('Debug endpoint disabled in production');
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
    async adminSeed(authHeader) {
        const adminSecret = process.env.ADMIN_SECRET;
        if (!adminSecret) {
            throw new common_1.ForbiddenException('Admin endpoint not configured');
        }
        const token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.replace('Bearer ', '');
        if (token !== adminSecret) {
            throw new common_1.UnauthorizedException('Invalid admin secret');
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
};
exports.AppController = AppController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "root", null);
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AppController.prototype, "health", null);
__decorate([
    (0, common_1.Get)('debug/seed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AppController.prototype, "debugSeed", null);
__decorate([
    (0, common_1.Post)('admin/seed'),
    __param(0, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AppController.prototype, "adminSeed", null);
exports.AppController = AppController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [app_service_1.AppService,
        prisma_service_1.PrismaService])
], AppController);
