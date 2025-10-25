import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouterDto, RouterDto, ProvisionRouterDto, ProvisionResponseDto, RouterHealthDto, RouterStatus } from './dto/router.dto';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class RoutersService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: RouterStatus, page?: number, limit?: number) {
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 20;
    const where = status ? { status: status as any } : {};
    
    const [routers, total] = await Promise.all([
      this.prisma.router.findMany({
        where,
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      this.prisma.router.count({ where }),
    ]);

    return {
      data: routers.map(r => this.toRouterDto(r)),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
      },
    };
  }

  async findOne(id: string): Promise<RouterDto> {
    const router = await this.prisma.router.findUnique({
      where: { id },
    });

    if (!router) {
      throw new NotFoundException('Router not found');
    }

    return this.toRouterDto(router);
  }

  async create(dto: CreateRouterDto): Promise<RouterDto & { installToken?: string }> {
    const adminSecretHash = await bcrypt.hash('admin', 10);
    const installToken = randomUUID();

    const router = await this.prisma.router.create({
      data: {
        serialNumber: dto.serialNumber,
        ssid: `${dto.name}-WiFi`,
        adminSecretHash,
        installToken,
        status: 'NEW',
      },
    });

    return {
      ...this.toRouterDto(router),
      installToken,
    };
  }

  async provision(id: string, dto: ProvisionRouterDto): Promise<ProvisionResponseDto> {
    const router = await this.findOne(id);
    
    await this.prisma.router.update({
      where: { id },
      data: {
        fqdnOrIp: dto.ipAddress,
        status: 'ONLINE',
      },
    });
    
    const script = this.generateRouterScript(dto);
    
    return {
      status: 'provisioning',
      jobId: randomUUID(),
      script,
    };
  }

  async getHealth(id: string): Promise<RouterHealthDto> {
    const router = await this.prisma.router.findUnique({
      where: { id },
    });

    if (!router) {
      throw new NotFoundException('Router not found');
    }

    await this.prisma.router.update({
      where: { id },
      data: {
        lastSeenAt: new Date(),
      },
    });
    
    return {
      status: router.status === 'ONLINE' ? 'online' : 'offline',
      uptime: Math.floor(Math.random() * 100000),
      connectedClients: Math.floor(Math.random() * 50),
      cpuUsage: Math.random() * 100,
      memoryUsage: Math.random() * 100,
      bandwidth: {
        download: Math.random() * 100,
        upload: Math.random() * 50,
      },
      lastChecked: new Date(),
    };
  }

  private generateRouterScript(dto: ProvisionRouterDto): string {
    return `
# WiNet RouterOS Provisioning Script
# IP Address: ${dto.ipAddress}
# SSID: ${dto.wifiSsid || 'WiNet-WiFi'}

/system identity set name=WiNet-Router

# Configure IP Address
/ip address add address=${dto.ipAddress}/24 interface=ether1

# Configure Wireless (if available)
/interface wireless security-profiles add name=winet-profile mode=wpa2-psk wpa2-pre-shared-key="${dto.wifiPassword || 'changeme'}"
/interface wireless set wlan1 ssid="${dto.wifiSsid || 'WiNet-WiFi'}" security-profile=winet-profile disabled=no

# Configure Hotspot
/ip pool add name=hotspot-pool ranges=10.5.50.2-10.5.50.254
/ip hotspot profile add dns-name="winet.local" name=winet-profile hotspot-address=10.5.50.1
/ip hotspot add address-pool=hotspot-pool interface=ether2 name=winet-hotspot profile=winet-profile

# Enable API for management
/ip service set api address=0.0.0.0/0 disabled=no

:log info "WiNet provisioning completed"
    `.trim();
  }

  private toRouterDto(router: any): RouterDto {
    return {
      id: router.id,
      name: router.ssid,
      model: 'RouterOS',
      serialNumber: router.serialNumber,
      ipAddress: router.fqdnOrIp,
      status: router.status as RouterStatus,
    };
  }
}
