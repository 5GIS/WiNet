import { IsString, IsUUID, IsArray, IsEnum, IsOptional, IsNumber } from 'class-validator';

export enum KycStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum DocumentType {
  ID_CARD = 'id_card',
  PASSPORT = 'passport',
  CERTIFICATE = 'certificate',
}

export enum MissionType {
  INSTALLATION = 'installation',
  MAINTENANCE = 'maintenance',
  REPAIR = 'repair',
  UPGRADE = 'upgrade',
}

export enum MissionStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export class RegisterTechnicianDto {
  @IsUUID()
  userId: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsArray()
  @IsString({ each: true })
  certifications: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  availableRegions?: string[];
}

export class KycDocumentDto {
  type: DocumentType;
  url: string;
  verified: boolean;
}

export class TechnicianDto {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  certifications: string[];
  kycStatus: KycStatus;
  kycDocuments?: KycDocumentDto[];
  availableRegions?: string[];
  rating?: number;
}

export class SubmitKycResponseDto {
  documentId: string;
  status: string;
}

export class CreateMissionDto {
  @IsUUID()
  routerId: string;

  @IsEnum(MissionType)
  type: MissionType;

  @IsString()
  scheduledAt: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class AssignMissionDto {
  @IsUUID()
  technicianId: string;
}

export class MissionDto {
  id: string;
  technicianId?: string;
  routerId: string;
  type: MissionType;
  status: MissionStatus;
  scheduledAt: Date;
  completedAt?: Date;
  notes?: string;
}
