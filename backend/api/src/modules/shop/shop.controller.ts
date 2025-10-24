import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ShopService } from './shop.service';
import { ProductDto, CreateOrderDto, OrderDto, ActivateProductDto, ActivateProductResponseDto, ProductCategory } from './dto/shop.dto';

@Controller('shop')
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Get('products')
  async getProducts(
    @Query('category') category?: ProductCategory,
    @Query('inStock') inStock?: boolean,
  ): Promise<ProductDto[]> {
    return this.shopService.getProducts(category, inStock);
  }

  @Get('products/:id')
  async getProduct(@Param('id') id: string): Promise<ProductDto> {
    return this.shopService.getProduct(id);
  }

  @Post('orders')
  async createOrder(@Body() dto: CreateOrderDto): Promise<OrderDto> {
    return this.shopService.createOrder(dto, 'mock-merchant-id');
  }

  @Post('orders/:id/activate')
  async activateProduct(
    @Param('id') id: string,
    @Body() dto: ActivateProductDto,
  ): Promise<ActivateProductResponseDto> {
    return this.shopService.activateProduct(id, dto);
  }
}
