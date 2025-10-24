import { IsString, IsUUID, IsNumber, Min, Max, IsOptional } from 'class-validator';

export enum TicketStatus {
  UNUSED = 'unused',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export class CreateTicketDto {
  @IsUUID()
  offerId: string;

  @IsUUID()
  paymentIntentId: string;
}

export class BatchPreloadDto {
  @IsUUID()
  offerId: string;

  @IsNumber()
  @Min(1)
  @Max(1000)
  quantity: number;

  @IsOptional()
  @IsString()
  prefix?: string;
}

export class BatchPreloadResponseDto {
  batchId: string;
  tickets: TicketDto[];
  downloadUrl: string;
}

export class ValidateTicketDto {
  @IsString()
  code: string;

  @IsString()
  macAddress: string;
}

export class ValidateTicketResponseDto {
  valid: boolean;
  ticket: TicketDto;
  accessCredentials?: {
    username: string;
    password: string;
  };
}

export class TicketDto {
  id: string;
  code: string;
  offerId: string;
  status: TicketStatus;
  activatedAt?: Date;
  expiresAt?: Date;
  macAddress?: string;
}
