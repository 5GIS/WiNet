import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ScriptsService {
  constructor(private prisma: PrismaService) {}

  async getInstallScript(routerId: string): Promise<string> {
    const router = await this.prisma.router.findUnique({
      where: { id: routerId },
    });

    if (!router) {
      throw new NotFoundException('Router not found');
    }

    if (router.scriptPath) {
      const scriptPath = path.join(process.cwd(), router.scriptPath);
      if (fs.existsSync(scriptPath)) {
        return fs.readFileSync(scriptPath, 'utf-8');
      }
    }

    return this.generateDefaultScript(router);
  }

  private generateDefaultScript(router: any): string {
    return `
# WiNet RouterOS Installation Script
# Router: ${router.serialNumber}
# Generated: ${new Date().toISOString()}

/system identity set name="${router.ssid}"

# Configure Hotspot
/ip hotspot profile
add dns-name="${router.fqdnOrIp || 'winet.local'}" name=winet-profile hotspot-address=10.5.50.1 login-by=http-chap

/ip pool
add name=winet-pool ranges=10.5.50.2-10.5.50.254

/ip hotspot
add address-pool=winet-pool disabled=no interface=ether2 name=winet-hotspot profile=winet-profile

# Configure DNS
/ip dns set servers=8.8.8.8,8.8.4.4 allow-remote-requests=yes

# Enable Hotspot User Manager API
/ip hotspot user
add name=admin password=admin profile=default

# WiNet Portal Configuration
/ip hotspot walled-garden
add dst-host=*.winet.local comment="WiNet Portal Access"

# Logging
/system logging
add action=remote topics=info,!debug prefix="[${router.serialNumber}]"

# Completed
:log info "WiNet installation completed for ${router.serialNumber}"
`.trim();
  }
}
