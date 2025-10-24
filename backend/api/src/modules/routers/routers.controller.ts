import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { RoutersService } from './routers.service';
import { CreateRouterDto, RouterDto, ProvisionRouterDto, ProvisionResponseDto, RouterHealthDto, RouterStatus } from './dto/router.dto';

@Controller('routers')
export class RoutersController {
  constructor(private readonly routersService: RoutersService) {}

  @Get()
  async findAll(
    @Query('status') status?: RouterStatus,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.routersService.findAll(status, page, limit);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<RouterDto> {
    return this.routersService.findOne(id);
  }

  @Post()
  async create(@Body() dto: CreateRouterDto): Promise<RouterDto> {
    return this.routersService.create(dto);
  }

  @Post(':id/provision')
  async provision(
    @Param('id') id: string,
    @Body() dto: ProvisionRouterDto,
  ): Promise<ProvisionResponseDto> {
    return this.routersService.provision(id, dto);
  }

  @Get(':id/health')
  async getHealth(@Param('id') id: string): Promise<RouterHealthDto> {
    return this.routersService.getHealth(id);
  }
}
