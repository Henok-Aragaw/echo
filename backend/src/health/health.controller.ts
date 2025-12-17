import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
} from '@nestjs/terminus';
import { PrismaClient } from '@prisma/client';

@Controller('health')
export class HealthController {
  private prisma = new PrismaClient();

  constructor(
    private health: HealthCheckService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        await this.prisma.$runCommandRaw({ ping: 1 });
        return {
          database: {
            status: 'up',
          },
        };
      },
    ]);
  }
}
