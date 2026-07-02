import { Module } from '@nestjs/common';
import { AiAnalysisService } from './ai.service';
import { AiClient } from './ai-client';

@Module({
  providers: [AiClient, AiAnalysisService],
  exports: [AiAnalysisService],
})
export class AiModule {}
