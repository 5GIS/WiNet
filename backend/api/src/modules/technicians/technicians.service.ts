import { Injectable, NotFoundException } from '@nestjs/common';
import { RegisterTechnicianDto, TechnicianDto, SubmitKycResponseDto, CreateMissionDto, MissionDto, AssignMissionDto, KycStatus, MissionStatus } from './dto/technician.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TechniciansService {
  private technicians: Map<string, TechnicianDto> = new Map();
  private missions: Map<string, MissionDto> = new Map();

  async register(dto: RegisterTechnicianDto): Promise<TechnicianDto> {
    const technician: TechnicianDto = {
      id: randomUUID(),
      ...dto,
      kycStatus: KycStatus.PENDING,
    };

    this.technicians.set(technician.id, technician);
    return technician;
  }

  async submitKyc(technicianId: string, file: any): Promise<SubmitKycResponseDto> {
    const technician = this.technicians.get(technicianId);
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    return {
      documentId: randomUUID(),
      status: 'pending_review',
    };
  }

  async getMissions(status?: MissionStatus, technicianId?: string): Promise<MissionDto[]> {
    let missions = Array.from(this.missions.values());
    
    if (status) {
      missions = missions.filter(m => m.status === status);
    }
    
    if (technicianId) {
      missions = missions.filter(m => m.technicianId === technicianId);
    }
    
    return missions;
  }

  async createMission(dto: CreateMissionDto): Promise<MissionDto> {
    const mission: MissionDto = {
      id: randomUUID(),
      ...dto,
      scheduledAt: new Date(dto.scheduledAt),
      status: MissionStatus.PENDING,
    };

    this.missions.set(mission.id, mission);
    return mission;
  }

  async assignMission(missionId: string, dto: AssignMissionDto): Promise<MissionDto> {
    const mission = this.missions.get(missionId);
    if (!mission) {
      throw new NotFoundException('Mission not found');
    }

    const technician = this.technicians.get(dto.technicianId);
    if (!technician) {
      throw new NotFoundException('Technician not found');
    }

    mission.technicianId = dto.technicianId;
    mission.status = MissionStatus.ASSIGNED;

    return mission;
  }
}
