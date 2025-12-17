import { Module } from '@nestjs/common';
import { FragmentsController } from './fragments.controller';
import { FragmentsService } from './fragments.service';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [AiModule], 
  controllers: [FragmentsController],
  providers: [FragmentsService],
  exports: [FragmentsService] 
})
export class FragmentsModule {}