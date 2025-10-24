import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { CreateThemeDto, ThemeDto, DeployThemeDto, DeployResponseDto } from './dto/theme.dto';

@Controller('portal-themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get('catalogue')
  async getCatalogue(): Promise<ThemeDto[]> {
    return this.themesService.getCatalogue();
  }

  @Post()
  async create(@Body() dto: CreateThemeDto): Promise<ThemeDto> {
    return this.themesService.create(dto);
  }

  @Post(':id/deploy')
  async deploy(
    @Param('id') id: string,
    @Body() dto: DeployThemeDto,
  ): Promise<DeployResponseDto> {
    return this.themesService.deploy(id, dto);
  }
}
