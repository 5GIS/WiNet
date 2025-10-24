import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto, UpdateOfferDto, OfferDto } from './dto/offer.dto';

@Controller('offers')
export class OffersController {
  constructor(private readonly offersService: OffersService) {}

  @Get()
  async findAll(
    @Query('routerId') routerId?: string,
    @Query('active') active?: boolean,
  ): Promise<OfferDto[]> {
    return this.offersService.findAll(routerId, active);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<OfferDto> {
    return this.offersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateOfferDto): Promise<OfferDto> {
    return this.offersService.create(dto);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateOfferDto,
  ): Promise<OfferDto> {
    return this.offersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    return this.offersService.delete(id);
  }
}
