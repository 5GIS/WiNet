import { IsString, IsNumber, IsUUID, IsBoolean, IsOptional, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class BandwidthDto {
  @IsNumber()
  download: number;

  @IsNumber()
  upload: number;
}

export class CreateOfferDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Min(1)
  duration: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => BandwidthDto)
  bandwidth?: BandwidthDto;

  @IsNumber()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsUUID()
  routerId: string;
}

export class UpdateOfferDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}

export class OfferDto {
  id: string;
  name: string;
  description?: string;
  duration: number;
  bandwidth?: BandwidthDto;
  price: number;
  currency: string;
  active: boolean;
  routerId: string;
}
