import { IsString, IsUUID, IsOptional, IsIP, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum RouterStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  PROVISIONING = 'provisioning',
  MAINTENANCE = 'maintenance',
}

export class LocationDto {
  latitude?: number;
  longitude?: number;
  address?: string;
}

export class CreateRouterDto {
  @IsString()
  name: string;

  @IsString()
  model: string;

  @IsString()
  serialNumber: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  location?: LocationDto;
}

export class RouterDto {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  ipAddress?: string;
  macAddress?: string;
  status: RouterStatus;
  location?: LocationDto;
  lastSeen?: Date;
  merchantId?: string;
}

export class ProvisionRouterDto {
  @IsIP()
  ipAddress: string;

  @IsString()
  adminPassword: string;

  @IsOptional()
  @IsString()
  wifiSsid?: string;

  @IsOptional()
  @IsString()
  wifiPassword?: string;
}

export class ProvisionResponseDto {
  status: string;
  jobId: string;
  script: string;
}

export class RouterHealthDto {
  status: 'online' | 'offline';
  uptime: number;
  connectedClients: number;
  cpuUsage: number;
  memoryUsage: number;
  bandwidth: {
    download: number;
    upload: number;
  };
  lastChecked: Date;
}
