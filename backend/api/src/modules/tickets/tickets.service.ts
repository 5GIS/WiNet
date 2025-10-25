import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateTicketDto, BatchPreloadDto, BatchPreloadResponseDto, ValidateTicketDto, ValidateTicketResponseDto, TicketDto, TicketStatus } from './dto/ticket.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TicketsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTicketDto): Promise<TicketDto> {
    const router = await this.prisma.router.findFirst();
    
    const ticket = await this.prisma.ticket.create({
      data: {
        code: this.generateCode(),
        offerId: dto.offerId,
        routerId: router?.id || 'default',
        status: 'PENDING',
      },
    });

    return {
      id: ticket.id,
      code: ticket.code,
      offerId: ticket.offerId,
      status: ticket.status as TicketStatus,
    };
  }

  async batchPreload(dto: BatchPreloadDto): Promise<BatchPreloadResponseDto> {
    const quantity = Math.min(dto.quantity || 100, 100);
    const tickets: TicketDto[] = [];
    const router = await this.prisma.router.findFirst();
    
    for (let i = 0; i < quantity; i++) {
      const code = dto.prefix ? `${dto.prefix}${this.generateCode(6)}` : this.generateCode();
      
      const ticket = await this.prisma.ticket.create({
        data: {
          code,
          offerId: dto.offerId,
          routerId: router?.id || 'default',
          status: 'PENDING',
        },
      });
      
      tickets.push({
        id: ticket.id,
        code: ticket.code,
        offerId: ticket.offerId,
        status: ticket.status as TicketStatus,
      });
    }

    return {
      batchId: randomUUID(),
      tickets,
      downloadUrl: `/downloads/batch-${randomUUID()}.csv`,
    };
  }

  async validate(id: string, dto: ValidateTicketDto): Promise<ValidateTicketResponseDto> {
    const ticket = await this.prisma.ticket.findFirst({
      where: {
        OR: [
          { id },
          { code: dto.code },
        ],
      },
      include: {
        offer: true,
        router: true,
      },
    });
    
    if (!ticket || ticket.status !== 'PENDING') {
      throw new BadRequestException('Invalid or expired ticket');
    }

    const expiresAt = new Date(Date.now() + ticket.offer.durationMinutes * 60 * 1000);

    await this.prisma.ticket.update({
      where: { id: ticket.id },
      data: {
        status: 'ACTIVE',
        expiresAt,
      },
    });

    const mikhmonResponse = await this.syncToMikhmon(ticket, dto.macAddress);

    return {
      valid: true,
      ticket: {
        id: ticket.id,
        code: ticket.code,
        offerId: ticket.offerId,
        status: 'ACTIVE' as TicketStatus,
        activatedAt: new Date(),
        expiresAt,
        macAddress: dto.macAddress,
      },
      accessCredentials: {
        username: ticket.code,
        password: this.generateCode(8),
      },
    };
  }

  private async syncToMikhmon(ticket: any, macAddress?: string): Promise<any> {
    return {
      synced: true,
      mikhmonUserId: `user_${ticket.id.substring(0, 8)}`,
      message: 'User added to Mikhmon Hotspot Manager',
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
