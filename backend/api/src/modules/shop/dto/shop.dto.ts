import { IsString, IsUUID, IsNumber, IsEnum, IsArray, IsOptional, IsUrl, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum ProductCategory {
  ROUTER = 'router',
  ACCESSORY = 'accessory',
  ANTENNA = 'antenna',
  CABLE = 'cable',
}

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class ProductDto {
  id: string;
  name: string;
  category: ProductCategory;
  sku: string;
  price: number;
  stock: number;
  specifications?: Record<string, any>;
  images?: string[];
}

export class OrderItemDto {
  @IsUUID()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  price?: number;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];
}

export class OrderDto {
  id: string;
  merchantId: string;
  items: OrderItemDto[];
  total: number;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: Date;
}

export class ActivateProductDto {
  @IsUUID()
  productId: string;

  @IsString()
  serialNumber: string;
}

export class ActivateProductResponseDto {
  activated: boolean;
  serialNumber: string;
  activatedAt: Date;
  warranty?: {
    expiresAt: Date;
    coverageType: string;
  };
}
