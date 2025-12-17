import { Module } from '@nestjs/common';
import { DailyMemoryController } from './daily-memory.controller';
import { DailyMemoryService } from './daily-memory.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [DailyMemoryController],
  providers: [DailyMemoryService],
})
export class DailyMemoryModule {}