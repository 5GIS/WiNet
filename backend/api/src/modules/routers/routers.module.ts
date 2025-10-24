import { Module } from '@nestjs/common';
import { RoutersController } from './routers.controller';
import { RoutersService } from './routers.service';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [RoutersController],
  providers: [RoutersService, PrismaService],
  exports: [RoutersService],
})
export class RoutersModule {}
