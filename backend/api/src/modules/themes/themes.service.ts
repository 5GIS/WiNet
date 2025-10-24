import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateThemeDto, ThemeDto, DeployThemeDto, DeployResponseDto, ThemeCategory } from './dto/theme.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class ThemesService {
  private themes: Map<string, ThemeDto> = new Map();

  constructor() {
    this.seedCatalogueThemes();
  }

  async getCatalogue(): Promise<ThemeDto[]> {
    return Array.from(this.themes.values()).filter(t => t.category === ThemeCategory.CATALOGUE);
  }

  async create(dto: CreateThemeDto): Promise<ThemeDto> {
    const theme: ThemeDto = {
      id: randomUUID(),
      ...dto,
    };

    this.themes.set(theme.id, theme);
    return theme;
  }

  async deploy(id: string, dto: DeployThemeDto): Promise<DeployResponseDto> {
    const theme = this.themes.get(id);
    if (!theme) {
      throw new NotFoundException('Theme not found');
    }

    return {
      status: 'deploying',
      deploymentId: randomUUID(),
      estimatedTime: 60,
    };
  }

  private seedCatalogueThemes() {
    const catalogueThemes = [
      {
        id: randomUUID(),
        name: 'Moderne Bleu',
        category: ThemeCategory.CATALOGUE,
        colors: { primary: '#3B82F6', secondary: '#1E40AF', background: '#F8FAFC' },
        price: 0,
      },
      {
        id: randomUUID(),
        name: 'Élégant Noir',
        category: ThemeCategory.CATALOGUE,
        colors: { primary: '#000000', secondary: '#6B7280', background: '#FFFFFF' },
        price: 0,
      },
    ];

    catalogueThemes.forEach(theme => this.themes.set(theme.id, theme as ThemeDto));
  }
}
