import { AIService } from '@modules/ai/services/ai.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [AIService],
  exports: [AIService],
})
export class AIModule {}
