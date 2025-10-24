import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouterDto, RouterDto, ProvisionRouterDto, ProvisionResponseDto, RouterHealthDto, RouterStatus } from './dto/router.dto';
import { PrismaService } from '../../common/prisma.service';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';

@Injectable()
export class RoutersService {
  constructor(private prisma: PrismaService) {}

  async findAll(status?: RouterStatus, page = 1, limit = 20) {
    const where = status ? { status: status as any } : {};
    
    const [routers, total] = await Promise.all([
      this.prisma.router.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.router.count({ where }),
    ]);

    return {
      data: routers.map(r => this.toRouterDto(r)),
      pagination: {
        page,
        limit,
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

  async create(dto: CreateRouterDto): Promise<RouterDto> {
    const adminSecretHash = await bcrypt.hash(dto.adminPassword, 10);

    const router = await this.prisma.router.create({
      data: {
        serialNumber: dto.serialNumber,
        ssid: dto.ssid,
        adminSecretHash,
        fqdnOrIp: dto.ipAddress,
        status: 'OFFLINE',
      },
    });

    return this.toRouterDto(router);
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
/system identity set name=WiNet-Router
/ip address add address=${dto.ipAddress}/24 interface=ether1
/interface wireless security-profiles add name=winet-profile mode=wpa2-psk wpa2-pre-shared-key=${dto.wifiPassword || 'changeme'}
/interface wireless set wlan1 ssid="${dto.wifiSsid || 'WiNet-WiFi'}" security-profile=winet-profile
    `.trim();
  }

  private toRouterDto(router: any): RouterDto {
    return {
      id: router.id,
      serialNumber: router.serialNumber,
      ssid: router.ssid,
      ipAddress: router.fqdnOrIp,
      status: router.status as RouterStatus,
    };
  }
}
