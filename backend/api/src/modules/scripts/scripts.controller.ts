import { Controller, Get, Query, UseGuards, Req, Res } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { ScriptTokenGuard } from '../../common/guards/script-token.guard';
import { Response } from 'express';

@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Get('install')
  @UseGuards(ScriptTokenGuard)
  async getInstallScript(
    @Query('token') token: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const script = await this.scriptsService.getInstallScript(req.router.id);
    
    res.setHeader('Content-Type', 'text/plain');
    res.setHeader('Content-Disposition', `attachment; filename="winet-install-${req.router.serialNumber}.rsc"`);
    return res.send(script);
  }
}
