import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  root() { return { ok: true, service: 'WiNet API', docs: '/health' }; }

  @Get('health')
  health() { return { status: 'ok', ts: new Date().toISOString() }; }
}
