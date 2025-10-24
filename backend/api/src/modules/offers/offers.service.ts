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
    
    return offers.map(o => this.toOfferDto(o));
  }

  async findOne(id: string): Promise<OfferDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundException('Offer not found');
    }

    return this.toOfferDto(offer);
  }

  async create(dto: CreateOfferDto): Promise<OfferDto> {
    const offer = await this.prisma.offer.create({
      data: {
        name: dto.name,
        priceCents: dto.price * 100,
        durationMinutes: dto.durationMinutes,
        bandwidthLimitKbps: dto.bandwidthLimit,
        active: true,
      },
    });

    return this.toOfferDto(offer);
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
        ...(dto.durationMinutes && { durationMinutes: dto.durationMinutes }),
        ...(dto.bandwidthLimit && { bandwidthLimitKbps: dto.bandwidthLimit }),
        ...(dto.active !== undefined && { active: dto.active }),
      },
    });

    return this.toOfferDto(updated);
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

  private toOfferDto(offer: any): OfferDto {
    return {
      id: offer.id,
      name: offer.name,
      price: offer.priceCents / 100,
      currency: 'EUR',
      durationMinutes: offer.durationMinutes,
      bandwidthLimit: offer.bandwidthLimitKbps,
      routerId: undefined,
      active: offer.active,
    };
  }
}
