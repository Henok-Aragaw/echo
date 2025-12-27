import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { DailyMemoryService } from './daily-memory.service';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@Controller('echoes')
@UseGuards(AuthGuard)
export class DailyMemoryController {
  constructor(private readonly service: DailyMemoryService) {}

  //Get All Memories (Paginated with Cursor)
  @Get()
  async getAllEchoes(
    @CurrentUser() user: any,
    @Query('cursor') cursor?: string
  ) {
    return this.service.getEchoes(user.id, cursor);
  }

  // Generate "Today's" Memory Immediately
  @Post('today')
  async generateToday(@CurrentUser() user: any) {
    return this.service.generateToday(user.id);
  }

  //Get Specific Date 
  @Get(':date')
  async getDailyMemory(@CurrentUser() user: any, @Param('date') date: string) {
    return this.service.getMemory(user.id, date);
  }
}