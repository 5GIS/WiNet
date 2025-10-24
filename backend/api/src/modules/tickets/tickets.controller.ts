import { Controller, Post, Body, Param } from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, BatchPreloadDto, BatchPreloadResponseDto, ValidateTicketDto, ValidateTicketResponseDto, TicketDto } from './dto/ticket.dto';

@Controller('tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Body() dto: CreateTicketDto): Promise<TicketDto> {
    return this.ticketsService.create(dto);
  }

  @Post('batch-preload')
  async batchPreload(@Body() dto: BatchPreloadDto): Promise<BatchPreloadResponseDto> {
    return this.ticketsService.batchPreload(dto);
  }

  @Post(':id/validate')
  async validate(
    @Param('id') id: string,
    @Body() dto: ValidateTicketDto,
  ): Promise<ValidateTicketResponseDto> {
    return this.ticketsService.validate(id, dto);
  }
}
