import { Module } from '@nestjs/common';
import { ScriptsController } from './scripts.controller';
import { ScriptsService } from './scripts.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [ScriptsController],
  providers: [ScriptsService, PrismaService],
})
export class ScriptsModule {}
