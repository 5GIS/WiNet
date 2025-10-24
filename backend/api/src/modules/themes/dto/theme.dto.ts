import { IsString, IsEnum, IsUUID, IsOptional, IsObject, IsUrl, IsNumber } from 'class-validator';

export enum ThemeCategory {
  CATALOGUE = 'catalogue',
  CUSTOM = 'custom',
}

export class ColorsDto {
  primary?: string;
  secondary?: string;
  background?: string;
}

export class CreateThemeDto {
  @IsString()
  name: string;

  @IsEnum(ThemeCategory)
  category: ThemeCategory;

  @IsOptional()
  @IsUUID()
  catalogueThemeId?: string;

  @IsOptional()
  @IsObject()
  colors?: ColorsDto;

  @IsOptional()
  @IsUrl()
  logo?: string;

  @IsOptional()
  @IsString()
  customCss?: string;
}

export class ThemeDto {
  id: string;
  name: string;
  category: ThemeCategory;
  colors?: ColorsDto;
  logo?: string;
  customCss?: string;
  price?: number;
  merchantId?: string;
}

export class DeployThemeDto {
  @IsUUID()
  routerId: string;
}

export class DeployResponseDto {
  status: string;
  deploymentId: string;
  estimatedTime: number;
}
