import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateOfferDto, UpdateOfferDto, OfferDto } from './dto/offer.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class OffersService {
  private offers: Map<string, OfferDto> = new Map();

  async findAll(routerId?: string, active?: boolean): Promise<OfferDto[]> {
    let offers = Array.from(this.offers.values());
    
    if (routerId) {
      offers = offers.filter(o => o.routerId === routerId);
    }
    
    if (active !== undefined) {
      offers = offers.filter(o => o.active === active);
    }
    
    return offers;
  }

  async findOne(id: string): Promise<OfferDto> {
    const offer = this.offers.get(id);
    if (!offer) {
      throw new NotFoundException('Offer not found');
    }
    return offer;
  }

  async create(dto: CreateOfferDto): Promise<OfferDto> {
    const offer: OfferDto = {
      id: randomUUID(),
      ...dto,
      currency: dto.currency || 'EUR',
      active: true,
    };

    this.offers.set(offer.id, offer);
    return offer;
  }

  async update(id: string, dto: UpdateOfferDto): Promise<OfferDto> {
    const offer = await this.findOne(id);
    
    Object.assign(offer, dto);
    
    return offer;
  }

  async delete(id: string): Promise<void> {
    const offer = await this.findOne(id);
    this.offers.delete(id);
  }
}
