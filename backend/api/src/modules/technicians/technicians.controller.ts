import { Controller, Post, Get, Body, Param, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { TechniciansService } from './technicians.service';
import { RegisterTechnicianDto, TechnicianDto, SubmitKycResponseDto, CreateMissionDto, MissionDto, AssignMissionDto, MissionStatus } from './dto/technician.dto';

@Controller('technicians')
export class TechniciansController {
  constructor(private readonly techniciansService: TechniciansService) {}

  @Post('register')
  async register(@Body() dto: RegisterTechnicianDto): Promise<TechnicianDto> {
    return this.techniciansService.register(dto);
  }

  @Post(':id/kyc')
  @UseInterceptors(FileInterceptor('file'))
  async submitKyc(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<SubmitKycResponseDto> {
    return this.techniciansService.submitKyc(id, file);
  }

  @Get('missions')
  async getMissions(
    @Query('status') status?: MissionStatus,
    @Query('technicianId') technicianId?: string,
  ): Promise<MissionDto[]> {
    return this.techniciansService.getMissions(status, technicianId);
  }

  @Post('missions')
  async createMission(@Body() dto: CreateMissionDto): Promise<MissionDto> {
    return this.techniciansService.createMission(dto);
  }

  @Post('missions/:id/assign')
  async assignMission(
    @Param('id') id: string,
    @Body() dto: AssignMissionDto,
  ): Promise<MissionDto> {
    return this.techniciansService.assignMission(id, dto);
  }
}
