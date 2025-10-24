import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateTicketDto, BatchPreloadDto, BatchPreloadResponseDto, ValidateTicketDto, ValidateTicketResponseDto, TicketDto, TicketStatus } from './dto/ticket.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TicketsService {
  private tickets: Map<string, TicketDto> = new Map();

  async create(dto: CreateTicketDto): Promise<TicketDto> {
    const ticket: TicketDto = {
      id: randomUUID(),
      code: this.generateCode(),
      offerId: dto.offerId,
      status: TicketStatus.UNUSED,
    };

    this.tickets.set(ticket.id, ticket);
    return ticket;
  }

  async batchPreload(dto: BatchPreloadDto): Promise<BatchPreloadResponseDto> {
    const tickets: TicketDto[] = [];
    
    for (let i = 0; i < dto.quantity; i++) {
      const code = dto.prefix ? `${dto.prefix}${this.generateCode(6)}` : this.generateCode();
      const ticket: TicketDto = {
        id: randomUUID(),
        code,
        offerId: dto.offerId,
        status: TicketStatus.UNUSED,
      };
      
      this.tickets.set(ticket.id, ticket);
      tickets.push(ticket);
    }

    return {
      batchId: randomUUID(),
      tickets,
      downloadUrl: `/downloads/batch-${randomUUID()}.csv`,
    };
  }

  async validate(id: string, dto: ValidateTicketDto): Promise<ValidateTicketResponseDto> {
    const ticket = Array.from(this.tickets.values()).find(t => t.id === id || t.code === dto.code);
    
    if (!ticket || ticket.status !== TicketStatus.UNUSED) {
      throw new BadRequestException('Invalid or expired ticket');
    }

    ticket.status = TicketStatus.ACTIVE;
    ticket.activatedAt = new Date();
    ticket.expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    ticket.macAddress = dto.macAddress;

    return {
      valid: true,
      ticket,
      accessCredentials: {
        username: ticket.code,
        password: this.generateCode(8),
      },
    };
  }

  private generateCode(length = 9): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
}
