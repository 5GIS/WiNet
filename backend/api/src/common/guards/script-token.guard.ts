import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ScriptTokenGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.query.token;

    if (!token) {
      throw new UnauthorizedException('Missing install token');
    }

    const router = await this.prisma.router.findUnique({
      where: { installToken: token },
    });

    if (!router) {
      throw new UnauthorizedException('Invalid or expired install token');
    }

    request.router = router;
    return true;
  }
}
