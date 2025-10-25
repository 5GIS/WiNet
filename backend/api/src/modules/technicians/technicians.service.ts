import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { RegisterTechnicianDto, TechnicianDto, SubmitKycResponseDto, CreateMissionDto, MissionDto, AssignMissionDto, KycStatus, MissionStatus } from './dto/technician.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TechniciansService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterTechnicianDto): Promise<TechnicianDto> {
    const technician = await this.prisma.technician.create({
      data: {
        userId: dto.userId,
        kycStatus: 'PENDING',
      },
      include: {
        user: true,
      },
    });

    return {
      id: technician.id,
      userId: technician.userId,
      firstName: dto.firstName,
      lastName: dto.lastName,
      certifications: [],
      kycStatus: technician.kycStatus as KycStatus,
    };
  }

  async submitKyc(technicianId: string, file: any): Promise<SubmitKycResponseDto> {
    const technician = await this.prisma.technician.findUnique({
      where: { id: technicianId },
    });

    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    const documentId = randomUUID();
    const kycPath = `/uploads/kyc/${documentId}-${file?.originalname || 'document.pdf'}`;

    await this.prisma.technician.update({
      where: { id: technicianId },
      data: {
        kycDocument: kycPath,
        kycStatus: 'PENDING',
      },
    });

    return {
      documentId,
      status: 'pending_review',
    };
  }

  async getMissions(status?: MissionStatus, technicianId?: string): Promise<MissionDto[]> {
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (technicianId) {
      where.technicianId = technicianId;
    }
    
    const missions = await this.prisma.mission.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return missions.map(m => ({
      id: m.id,
      technicianId: m.technicianId,
      routerId: m.routerId,
      type: 'installation' as any,
      status: m.status as MissionStatus,
      scheduledAt: m.createdAt,
    }));
  }

  async createMission(dto: CreateMissionDto): Promise<MissionDto> {
    if (dto.technicianId) {
      const techExists = await this.prisma.technician.findUnique({
        where: { id: dto.technicianId },
      });
      if (!techExists) {
        throw new NotFoundException(`Technician ${dto.technicianId} not found`);
      }
    }

    const routerExists = await this.prisma.router.findUnique({
      where: { id: dto.routerId },
    });
    if (!routerExists) {
      throw new NotFoundException(`Router ${dto.routerId} not found`);
    }

    if (!dto.technicianId) {
      throw new BadRequestException('technicianId is required - use assignMission to assign later if needed');
    }

    const mission = await this.prisma.mission.create({
      data: {
        technicianId: dto.technicianId,
        routerId: dto.routerId,
        description: dto.description || '',
        status: 'ASSIGNED',
      },
    });

    return {
      id: mission.id,
      technicianId: mission.technicianId,
      routerId: mission.routerId,
      type: dto.type,
      status: mission.status as MissionStatus,
      scheduledAt: mission.createdAt,
    };
  }

  async assignMission(missionId: string, dto: AssignMissionDto): Promise<MissionDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const updatedMission = await this.prisma.mission.update({
      where: { id: missionId },
      data: {
        technicianId: dto.technicianId,
        status: 'ASSIGNED',
      },
    });

    return {
      id: updatedMission.id,
      technicianId: updatedMission.technicianId,
      routerId: updatedMission.routerId,
      type: 'installation' as any,
      status: updatedMission.status as MissionStatus,
      scheduledAt: updatedMission.createdAt,
    };
  }

  async completeMission(missionId: string): Promise<MissionDto> {
    const mission = await this.prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const updatedMission = await this.prisma.mission.update({
      where: { id: missionId },
      data: {
        status: 'DONE',
        completedAt: new Date(),
      },
    });

    return {
      id: updatedMission.id,
      technicianId: updatedMission.technicianId,
      routerId: updatedMission.routerId,
      type: 'installation' as any,
      status: updatedMission.status as MissionStatus,
      scheduledAt: updatedMission.createdAt,
    };
  }
}
