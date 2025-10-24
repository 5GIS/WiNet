import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRouterDto, RouterDto, ProvisionRouterDto, ProvisionResponseDto, RouterHealthDto, RouterStatus } from './dto/router.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class RoutersService {
  private routers: Map<string, RouterDto> = new Map();

  async findAll(status?: RouterStatus, page = 1, limit = 20) {
    let routers = Array.from(this.routers.values());
    
    if (status) {
      routers = routers.filter(r => r.status === status);
    }

    const total = routers.length;
    const start = (page - 1) * limit;
    const data = routers.slice(start, start + limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async findOne(id: string): Promise<RouterDto> {
    const router = this.routers.get(id);
    if (!router) {
      throw new NotFoundException('Router not found');
    }
    return router;
  }

  async create(dto: CreateRouterDto): Promise<RouterDto> {
    const router: RouterDto = {
      id: randomUUID(),
      ...dto,
      status: RouterStatus.OFFLINE,
    };

    this.routers.set(router.id, router);
    return router;
  }

  async provision(id: string, dto: ProvisionRouterDto): Promise<ProvisionResponseDto> {
    const router = await this.findOne(id);
    
    router.ipAddress = dto.ipAddress;
    router.status = RouterStatus.PROVISIONING;
    
    const script = this.generateRouterScript(dto);
    
    return {
      status: 'provisioning',
      jobId: randomUUID(),
      script,
    };
  }

  async getHealth(id: string): Promise<RouterHealthDto> {
    const router = await this.findOne(id);
    
    return {
      status: router.status === RouterStatus.ONLINE ? 'online' : 'offline',
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
}
