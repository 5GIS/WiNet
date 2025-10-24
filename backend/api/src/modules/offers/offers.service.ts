import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto, UpdateOfferDto, OfferDto } from './dto/offer.dto';
import { PrismaService } from '../../common/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  async findAll(routerId?: string, active?: boolean): Promise<OfferDto[]> {
    const where: any = {};
    
    if (active !== undefined) {
      where.active = active;
    }

    const offers = await this.prisma.offer.findMany({
      where,
    });
    
    return offers.map(o => this.toOfferDto(o, routerId || 'default-router'));
  }

  async findOne(id: string): Promise<OfferDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return this.toOfferDto(offer, 'default-router');
  }

  async create(dto: CreateOfferDto): Promise<OfferDto> {
    const offer = await this.prisma.offer.create({
      data: {
        name: dto.name,
        priceCents: dto.price * 100,
        durationMinutes: dto.duration,
        bandwidthLimitKbps: dto.bandwidth?.download || 5120,
        active: true,
      },
    });

    return this.toOfferDto(offer, dto.routerId);
  }

  async update(id: string, dto: UpdateOfferDto): Promise<OfferDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    const updated = await this.prisma.offer.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.price && { priceCents: dto.price * 100 }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });

    return this.toOfferDto(updated, 'default-router');
  }

  async delete(id: string): Promise<void> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    await this.prisma.offer.delete({
      where: { id },
    });
  }

  private toOfferDto(offer: any, routerId: string): OfferDto {
    return {
      id: offer.id,
      name: offer.name,
      description: `${offer.durationMinutes} minutes WiFi access`,
      duration: offer.durationMinutes,
      bandwidth: {
        download: offer.bandwidthLimitKbps || 5120,
        upload: (offer.bandwidthLimitKbps || 5120) / 2,
      },
      price: offer.priceCents / 100,
      currency: 'EUR',
      routerId,
      active: offer.active,
    };
  }
}
