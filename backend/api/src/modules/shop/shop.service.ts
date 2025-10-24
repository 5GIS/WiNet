import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductDto, CreateOrderDto, OrderDto, ActivateProductDto, ActivateProductResponseDto, ProductCategory, OrderStatus } from './dto/shop.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ShopService {
  private products: Map<string, ProductDto> = new Map();
  private orders: Map<string, OrderDto> = new Map();

  constructor() {
    this.seedProducts();
  }

  async getProducts(category?: ProductCategory, inStock?: boolean): Promise<ProductDto[]> {
    let products = Array.from(this.products.values());
    
    if (category) {
      products = products.filter(p => p.category === category);
    }
    
    if (inStock !== undefined) {
      products = products.filter(p => inStock ? p.stock > 0 : p.stock === 0);
    }
    
    return products;
  }

  async getProduct(id: string): Promise<ProductDto> {
    const product = this.products.get(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createOrder(dto: CreateOrderDto, merchantId: string): Promise<OrderDto> {
    const itemsWithPrices = await Promise.all(
      dto.items.map(async item => {
        const product = await this.getProduct(item.productId);
        return {
          ...item,
          price: product.price,
        };
      })
    );

    const total = itemsWithPrices.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order: OrderDto = {
      id: randomUUID(),
      merchantId,
      items: itemsWithPrices,
      total,
      status: OrderStatus.PENDING,
      createdAt: new Date(),
    };

    this.orders.set(order.id, order);
    return order;
  }

  async activateProduct(orderId: string, dto: ActivateProductDto): Promise<ActivateProductResponseDto> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return {
      activated: true,
      serialNumber: dto.serialNumber,
      activatedAt: new Date(),
      warranty: {
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        coverageType: 'Standard 1 year',
      },
    };
  }

  private seedProducts() {
    const products = [
      {
        id: randomUUID(),
        name: 'MikroTik hAP ac2',
        category: ProductCategory.ROUTER,
        sku: 'MTK-HAP-AC2',
        price: 89.99,
        stock: 25,
        specifications: { wifi: '802.11ac', ports: 5, memory: '128MB' },
      },
      {
        id: randomUUID(),
        name: 'TP-Link Omada EAP225',
        category: ProductCategory.ROUTER,
        sku: 'TPL-EAP225',
        price: 69.99,
        stock: 15,
        specifications: { wifi: '802.11ac', coverage: '200m²' },
      },
    ];

    products.forEach(product => this.products.set(product.id, product as ProductDto));
  }
}
