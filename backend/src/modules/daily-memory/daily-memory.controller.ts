import { Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { DailyMemoryService } from './daily-memory.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('echoes')
@UseGuards(AuthGuard)
export class DailyMemoryController {
  constructor(private readonly service: DailyMemoryService) {}

  @Get()
  async getAllEchoes(@CurrentUser() user: any) {
    return this.service.getEchoes(user.id);
  }

  @Post('today')
  async generateToday(@CurrentUser() user: any) {
    return this.service.generateToday(user.id);
  }

  @Get(':date')
  async getDailyMemory(@CurrentUser() user: any, @Param('date') date: string) {
    // Date format YYYY-MM-DD
    return this.service.getMemory(user.id, date);
  }
}